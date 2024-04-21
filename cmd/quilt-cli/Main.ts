import * as path from "path"
import * as fs from "fs"
import * as cp from "child_process"
import {z} from "zod"
import remarkFrontmatter from "remark-frontmatter"
import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import {unified} from "unified"
import yaml from "yaml"
import {type Root} from "node_modules/remark-parse/lib/index.js"
import {addDays, format, isValid, parseISO, subDays} from "date-fns"
import {Logger} from "@pkg/logger/Logger.js"

const logger = new Logger("Main")

const AppConfig = z.object({
	notebookDir: z.string(),
})
type AppConfig = z.infer<typeof AppConfig>

async function main(args: string[]) {
	let command = args[0]

	if (command === "init") {
		await ensureQuiltNotebook(process.cwd())
		return
	}

	const config = await loadAppConfig()
	if (isRelativeDateSpecifier(command)) {
		const date = dateFromString(command)
		const [todos, journalEntry] = await Promise.all([
			await getTodosForDate(config, date),
			await loadJournalEntry(config, date),
		])
		console.log({todos, journalEntry})
	}
	switch (command) {
		case "journal": {
			const date = dateFromString(args[1] ?? "today")
			await openJournalEntry(config, date)
			break
		}
	}
}

async function ensureQuiltNotebook(dir: string) {
	const quiltDir = path.join(dir, ".quilt")

	if (!fs.existsSync(quiltDir)) {
		logger.debug("ensureQuiltNotebook", "create .quilt directory")
		await fs.promises.mkdir(quiltDir, {recursive: true})
	}

	const todosFile = path.join(quiltDir, "todos.json")
	if (!fs.existsSync(todosFile)) {
		logger.debug("ensureQuiltNotebook", "create .quilt/todos.json")
		const content = {todos: []}
		await fs.promises.writeFile(
			todosFile,
			JSON.stringify(content, null, 4),
			"utf8",
		)
	}

	const journalDir = path.join(quiltDir, "journal")
	if (!fs.existsSync(journalDir)) {
		logger.debug("ensureQuiltNotebook", "create .quilt/journal")
		await fs.promises.mkdir(journalDir, {recursive: true})
	}
	// TODO(david): validate that what exists in this file is what we expect.
}

async function getTodosForDate(config: AppConfig, date: Date): Promise<Todo[]> {
	const todos = await getTodos(config)
	return []
}

const RELATIVE_DATE_SPECIFIERS = ["today", "yesterday", "tomorrow"]

function isRelativeDateSpecifier(str: string) {
	return RELATIVE_DATE_SPECIFIERS.includes(str)
}

function dateFromString(str: string): Date {
	switch (str) {
		case "today":
			return new Date()
		case "yesterday":
			return subDays(new Date(), 1)
		case "tomorrow":
			return addDays(new Date(), 1)
		default: {
			const date = new Date(str)
			if (!isValid(date)) {
				throw new Error(`invalid date: "${str}"`)
			}
			return date
		}
	}
}

const Todo = z.object({
	id: z.string(),
	title: z.string(),
	notes: z.string().optional(),
	repeat: z.string().optional(),
})
type Todo = z.infer<typeof Todo>

const Note = z.object({
	id: z.string(),
	title: z.string(),
	content: z.string(),
	todos: z.array(Todo),
})
type Note = z.infer<typeof Note>

function getJournalEntryFilename(date: Date): string {
	return format(date, "yyyy-MM-dd")
}

function getJournalEntryFilepath(config: AppConfig, date: Date): string {
	const filename = getJournalEntryFilename(date)
	return path.join(config.notebookDir, ".quilt/journal", `${filename}.md`)
}

function getJournalEntryTitle(date: Date): string {
	return format(date, "EEE, MMM d yyyy")
}

async function loadJournalEntry(
	config: AppConfig,
	date: Date,
): Promise<Note | null> {
	const file = getJournalEntryFilepath(config, date)

	if (!fs.existsSync(file)) {
		return null
	}

	const markdown = await fs.promises.readFile(file, "utf8")
	const parsed = await parseMarkdown(markdown)
	return Note.parse({
		id: parsed.frontmatter["id"],
		title: parsed.frontmatter["title"],
		createdat: parseISO(parsed.frontmatter["createdAt"]),
		content: markdown,
		todos: [],
	})
}

interface ParseMarkdownResult {
	ast: Root
	frontmatter: Record<string, string>
}
async function parseMarkdown(markdown: string): Promise<ParseMarkdownResult> {
	const parser = unified()
		.use(remarkParse)
		.use(remarkFrontmatter)
		.use(remarkGfm)
	const doc = await parser.parse(markdown)
	const firstChild = doc.children[0]
	const result: ParseMarkdownResult = {
		ast: doc,
		frontmatter: {},
	}
	if (firstChild?.type === "yaml") {
		const parsed = yaml.parse(firstChild.value)
		result.frontmatter = parsed
	}
	return result
}

async function openJournalEntry(config: AppConfig, date: Date) {
	const file = getJournalEntryFilepath(config, date)
	if (!fs.existsSync(file)) {
		const title = getJournalEntryTitle(date)
		const content = `---
id: ${uuid("note")}
title: ${title}
createdAt: ${date.toISOString()}
todo:
---

`
		await fs.promises.mkdir(path.dirname(file), {recursive: true})
		await fs.promises.writeFile(file, content, "utf8")
	}
	openFileEditor(file)
}

function openFileEditor(file: string) {
	cp.execSync(`$EDITOR ${file}`, {stdio: "inherit"})
}

function isDirectoryQuiltNotebook(dir: string): boolean {
	return fs.existsSync(path.join(dir, ".quilt"))
}

async function loadAppConfig(): Promise<AppConfig> {
	const config: Partial<AppConfig> = {
		notebookDir: "",
	}
	if (process.env["QUILT_DEFAULT_NOTEBOOK"]) {
		const dir = process.env["QUILT_DEFAULT_NOTEBOOK"]
		if (!isDirectoryQuiltNotebook(dir)) {
			logger.warn(
				"loadAppConfig",
				"$QUILT_DEFAULT_NOTEBOOK is not a valid quilt notebook",
				{dir},
			)
		} else {
			config.notebookDir = dir
		}
	}
	if (!config.notebookDir) {
		function findNearestQuiltNotebook(dir: string): string | null {
			logger.debug("loadAppConfig", "findNearestQuiltNotebook", {dir})
			if (isDirectoryQuiltNotebook(dir)) {
				return dir
			} else {
				const parent = path.dirname(dir)
				if (parent && parent !== dir) {
					return findNearestQuiltNotebook(parent)
				}
			}
			return null
		}
		const dir = findNearestQuiltNotebook(process.cwd())
		if (dir) {
			config.notebookDir = dir
		}
	}
	if (!config.notebookDir) {
		throw logger.newError("loadAppConfig", "could not find quilt notebook")
	}
	const result = AppConfig.safeParse(config)
	if (!result.success) {
		throw logger.newError("loadAppConfig", "invalid app config", {
			config,
			error: result.error,
		})
	}
	return result.data
}

async function getTodos(config: AppConfig): Promise<Todo[]> {
	const file = path.join(config.notebookDir, ".quilt", "todos.json")
	const text = await fs.promises.readFile(file, "utf8")
	const data = JSON.parse(text)
	const todo = data.todo
	if (!Array.isArray(todo)) {
		return []
	}
	const result: Todo[] = []
	for (const json of todo) {
		const parseResult = Todo.safeParse(json)
		if (!parseResult.success) {
			logger.warn("getTodos", "invalid todo", {todo: json})
			continue
		}
		result.push(parseResult.data)
	}
	return result
}

function uuid(prefix: string) {
	return `${prefix}_${crypto.randomUUID().slice(2)}`
}

main(process.argv.slice(2))
