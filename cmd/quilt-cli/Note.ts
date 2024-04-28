import * as fs from "fs"
import * as cp from "child_process"
import {z} from "zod"
import remarkFrontmatter from "remark-frontmatter"
import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import {unified} from "unified"
import yaml from "yaml"
import {type Root} from "node_modules/remark-parse/lib/index.js"
import {Logger} from "@pkg/logger/Logger.js"

const logger = new Logger("Note")

export const Todo = z.object({
	id: z.string(),
	title: z.string(),
	notes: z.string().optional(),
	repeat: z.string().optional(),
})
export type Todo = z.infer<typeof Todo>

export const Note = z.object({
	id: z.string(),
	createdAt: z.date(),
	title: z.string(),
	content: z.string(),
	todos: z.array(Todo),
})
export type Note = z.infer<typeof Note>

export async function loadNoteFromFile(file: string): Promise<Note> {
	const markdown = await fs.promises.readFile(file, "utf8")
	const parsed = await parseMarkdown(markdown)

	const todos: Todo[] = []
	if (Array.isArray(parsed.frontmatter["todo"])) {
		for (const item of parsed.frontmatter["todo"]) {
			const parsedTodo = Todo.safeParse({id: "", title: item})
			if (!parsedTodo.success) {
				logger.warn("getJournalEntryForDate", "invalid todo", {
					todo: item,
				})
			} else {
				todos.push(parsedTodo.data)
			}
		}
	}
	return Note.parse({
		id: parsed.frontmatter["id"],
		title: parsed.frontmatter["title"],
		createdAt: null,
		content: markdown,
		todos,
	})
}

interface ParseMarkdownResult {
	ast: Root
	frontmatter: Record<string, string>
}

export async function parseMarkdown(
	markdown: string,
): Promise<ParseMarkdownResult> {
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

export function openNoteInEditor(file: string) {
	cp.execSync(`$EDITOR ${file}`, {stdio: "inherit"})
}
