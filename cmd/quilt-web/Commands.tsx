import {AppContext} from "./App.js"
import {batch, signal} from "@preact/signals"
import {KITCHEN_SINK_CONTENT, WELCOME_CONTENT} from "./Editor.js"

interface CommandContext extends AppContext {}

export interface Command<TOptions extends object = any> {
	name: string
	handle(context: CommandContext, options: TOptions): any
}

type CommandOptions<T extends Command> = Parameters<
	T["handle"]
>[1] extends object
	? Parameters<T["handle"]>[1]
	: {}

export const CommandToggleZenMode = {
	name: "Toggle Zen Mode",
	async handle(context) {
		context.state.zenMode.value = !context.state.zenMode.value
	},
} satisfies Command

export const DEBUG_CommandResetApp = {
	name: "DEBUG: Reset App",
	async handle(context) {},
} satisfies Command

export const DEBUG_CommandOpenWelcomeNote = {
	name: "DEBUG: Open Welcome Note",
	async handle(context) {
		const note = createExampleNote()
		note.content = WELCOME_CONTENT
		context.state.activeNote.value = note
	},
} satisfies Command

export const DEBUG_CommandOpenKitchenSinkNote = {
	name: "DEBUG: Open Kitchen Sink Note",
	async handle(context) {
		const note = createExampleNote()
		note.content = KITCHEN_SINK_CONTENT
		context.state.activeNote.value = note
	},
} satisfies Command

function createExampleNote() {
	return {
		content: "",
		tags: signal([
			{id: "1", name: "home"},
			{id: "2", name: "work"},
			{id: "3", name: "kona"},
			{id: "4", name: "chore"},
			{id: "5", name: "important"},
		]),
		todos: signal([
			{
				id: "1",
				content:
					"this is an example todo with some extra long content so that it wraps to the next line.",
				completedAt: null,
			},
			{
				id: "2",
				content:
					"this is an example todo with some extra long content so that it wraps to the next line.",
				completedAt: null,
			},
			{
				id: "3",
				content:
					"this is an example todo with some extra long content so that it wraps to the next line.",
				completedAt: null,
			},
			{
				id: "4",
				content:
					"this is an example todo with some extra long content so that it wraps to the next line.",
				completedAt: null,
			},
			{
				id: "5",
				content:
					"this is an example todo with some extra long content so that it wraps to the next line.",
				completedAt: null,
			},
		]),
	}
}

export function runCommand<T extends Command>(
	context: CommandContext,
	command: T,
	options?: CommandOptions<T>,
): void {
	batch(() => {
		command.handle(context, options)
	})
}

const DEBUG_COMMANDS: Command[] = [
	DEBUG_CommandResetApp,
	DEBUG_CommandOpenWelcomeNote,
	DEBUG_CommandOpenKitchenSinkNote,
]

export const COMMANDS: Command[] = [...DEBUG_COMMANDS, CommandToggleZenMode]
