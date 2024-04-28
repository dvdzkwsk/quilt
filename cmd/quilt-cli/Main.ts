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
import {
	addDays,
	endOfDay,
	format,
	isValid,
	parseISO,
	startOfDay,
	subDays,
} from "date-fns"
import {Logger} from "@pkg/logger/Logger.js"

const logger = new Logger("Main")

interface Command {
	name: string
	run(args: string[]): void
}

const COMMANDS: Command[] = [
	{
		name: "edit",
		async run(args: string[]) {
			const config = await loadAppConfig()
			const date = dateFromString(args[0] ?? "today")
			if (!date) {
				throw new Error("invalid date: '" + args[1] + "'")
			}
			const file = await ensureJournalEntryForDate(config, date)
			await openFileEditor(file)
		},
	},
	{
		name: "init",
		async run(args: string[]) {
			await ensureQuiltNotebook(process.cwd())
		},
	},
	{
		name: "journal",
		async run(args: string[]) {
			const config = await loadAppConfig()
			const date = dateFromString(args[0] ?? "today")
			if (!date) {
				throw new Error("invalid date: '" + args[0] + "'")
			}
			const file = await ensureJournalEntryForDate(config, date)
			await openFileEditor(file)
		},
	},
	{
		name: "show",
		async run(args: string[]) {
			const config = await loadAppConfig()
			const date = dateFromString(args[0])
			if (!date) {
				throw new Error("invalid date: '" + args[0] + "'")
			}
			await printJournalEntry(config, date)
		},
	},
	{
		name: "today",
		async run(args: string[]) {
			const config = await loadAppConfig()
			const date = dateFromString("today")!
			await printJournalEntry(config, date)
		},
	},
	{
		name: "todo",
		async run(args: string[]) {
			const config = await loadAppConfig()
			let {startDate, endDate} = parseDateRange(args[0] ?? "today")
			if (!startDate) {
				throw new Error("invalid date: '" + args[0] + "'")
			}
			if (!endDate) {
				endDate = startDate
			}
			startDate = startOfDay(startDate)
			endDate = endOfDay(endDate)
			console.log(
				"todo: print for:\n  from: %s\n    to: %s",
				startDate.toLocaleString(),
				endDate.toLocaleString(),
			)
		},
	},
]

function parseDateRange(str: string): {
	startDate: Date | null
	endDate: Date | null
} {
	const [start, end] = str.split("..")
	return {
		startDate: dateFromString(start),
		endDate: dateFromString(end),
	}
}

const AppConfig = z.object({
	notebookDir: z.string(),
})
type AppConfig = z.infer<typeof AppConfig>

async function main(osArgs: string[]) {
	let commandName: string | undefined

	const args: string[] = []
	for (const arg of osArgs) {
		if (arg.startsWith("-")) {
			args.push(arg)
			continue
		}
		if (!commandName) {
			commandName = arg
		} else {
			args.push(arg)
		}
	}
	if (!commandName) {
		printUsage()
		return
	}
	const command = COMMANDS.find((cmd) => cmd.name === commandName)
	if (!command) {
		throw new Error("unknown command: " + commandName)
	}
	await command.run(args)
}

function printUsage() {
	console.log("")
	console.log("Usage: quilt <command>")
	console.log("")
	console.log("Available commands:")
	for (const command of COMMANDS.sort((a, b) =>
		a.name.localeCompare(b.name),
	)) {
		console.log("  %s ", command.name)
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
	// TODO(david): register the notebook with global registry
}

async function todosForDate(config: AppConfig, date: Date): Promise<Todo[]> {
	const todos = await getTodos(config)
	return []
}

function dateFromString(str: string): Date | null {
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
				return null
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

function journalFilepathForDate(config: AppConfig, date: Date): string {
	const filename = format(date, "yyyy-MM-dd")
	return path.join(config.notebookDir, ".quilt/journal", `${filename}.md`)
}

async function loadJournalEntry(
	config: AppConfig,
	date: Date,
): Promise<Note | null> {
	const file = journalFilepathForDate(config, date)

	if (!fs.existsSync(file)) {
		return null
	}

	const markdown = await fs.promises.readFile(file, "utf8")
	const parsed = await parseMarkdown(markdown)
	return Note.parse({
		id: parsed.frontmatter["id"],
		title: parsed.frontmatter["title"],
		createdAt: parseISO(parsed.frontmatter["createdAt"]),
		content: markdown,
		todos: [],
	})
}

async function printJournalEntry(config: AppConfig, date: Date) {
	const [todos, journalEntry] = await Promise.all([
		await todosForDate(config, date),
		await loadJournalEntry(config, date),
	])
	console.log({
		todos,
		journalEntry,
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

async function ensureJournalEntryForDate(
	config: AppConfig,
	date: Date,
): Promise<string> {
	const file = journalFilepathForDate(config, date)
	if (!fs.existsSync(file)) {
		const title = format(date, "EEE, MMM d yyyy")
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
	return file
}

function openFileEditor(file: string) {
	cp.execSync(`$EDITOR ${file}`, {stdio: "inherit"})
}

function isDirectoryQuiltNotebook(dir: string): boolean {
	return fs.existsSync(path.join(dir, ".quilt"))
}

function findNearestQuiltNotebook(dir: string): string | null {
	logger.debug("findNearestQuiltNotebook", "check for .quilt directory", {
		dir,
	})
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

async function loadAppConfig(): Promise<AppConfig> {
	const config: Partial<AppConfig> = {
		notebookDir: await getActiveNotebook(),
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

async function getActiveNotebook(): Promise<string> {
	let notebook: string | null = null

	notebook = process.env["QUILT_NOTEBOOK"]!
	if (notebook) {
		logger.debug(
			"getActiveNotebook",
			"using notebook specified by QUILT_NOTEBOOK environment variable",
			{dir: notebook},
		)
	}
	if (!notebook) {
		notebook = findNearestQuiltNotebook(process.cwd())
	}
	if (!notebook) {
		logger.debug(
			"getActiveNotebook",
			"no notebook found in current directory, checking for a default notebook",
		)
		const notebook = process.env["QUILT_DEFAULT_NOTEBOOK"]
		if (notebook) {
			logger.debug(
				"getActiveNotebook",
				"found default notebook with $QUILT_DEFAULT_NOTEBOOK",
				{dir: notebook},
			)
		}
	}
	if (!notebook) {
		throw logger.newError("getActiveNotebook", "could not find a notebook")
	}
	if (!isDirectoryQuiltNotebook(notebook)) {
		throw logger.newError(
			"getActiveNotebook",
			"directory is not a valid notebook",
			{dir: notebook},
		)
	}
	return notebook
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

;(async () => {
	try {
		await main(process.argv.slice(2))
	} catch (error) {
		console.error(error)
		process.exit(1)
	}
})()
