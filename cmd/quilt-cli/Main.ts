import * as path from "path"
import * as fs from "fs"
import * as cp from "child_process"
import {z} from "zod"
import {addDays, format, isValid, subDays} from "date-fns"
import {Logger} from "@pkg/logger/Logger.js"
import {
	ensureJournalEntryForDate,
	getJournalEntriesInDateRange,
	printJournalEntry,
} from "./Journal.js"

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
			const notes = await getJournalEntriesInDateRange(
				config,
				startDate,
				endDate,
			)
			for (const note of notes) {
				const title = format(note.createdAt, "EEE, MMM d yyyy")
				console.log("%s", title)
				for (const todo of note.todos) {
					console.log("[ ] %s", todo.title)
				}
				console.log("")
			}
		},
	},
]

const AppConfig = z.object({
	notebookDir: z.string(),
})
export type AppConfig = z.infer<typeof AppConfig>

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

function parseDateRange(str: string): {
	startDate: Date | null
	endDate: Date | null
} {
	const [start, end] = str.split("..")
	const result = {
		startDate: dateFromString(start),
		endDate: dateFromString(end),
	}
	// use <startdate>.. as shorthand for <startdate>..today
	if (!result.endDate && str.includes("..")) {
		result.endDate = new Date()
	}
	return result
}

export function uuid(prefix: string) {
	return `${prefix}_${crypto.randomUUID().slice(2)}`
}

export function openFileEditor(file: string) {
	cp.execSync(`$EDITOR ${file}`, {stdio: "inherit"})
}

;(async () => {
	try {
		await main(process.argv.slice(2))
	} catch (error) {
		console.error(error)
		process.exit(1)
	}
})()
