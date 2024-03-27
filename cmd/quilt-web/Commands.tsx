import {AppContext} from "./App.js"

interface CommandContext extends AppContext {}

export interface Command<TOptions extends object = any> {
	name: string
	handler(options: TOptions, context: CommandContext): any
}

type CommandOptions<T extends Command> = Parameters<
	T["handler"]
>[0] extends object
	? Parameters<T["handler"]>[0]
	: {}

export const CommandCreateNote = {
	name: "Create Note",
	handler() {
		return "hello" as const
	},
} satisfies Command

export function runCommand<T extends Command>(
	command: T,
	options: CommandOptions<T>,
	context: CommandContext,
): void {
	command.handler(options, context)
}

export const COMMANDS = [CommandCreateNote] satisfies Command[]
