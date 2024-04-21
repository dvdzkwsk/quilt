import {AppContext} from "./App.js"
import {batch} from "@preact/signals"

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

export const CommandResetApp = {
	name: "Reset App",
	async handle(context) {},
} satisfies Command

export function runCommand<T extends Command>(
	context: CommandContext,
	command: T,
	options: CommandOptions<T>,
): void {
	batch(() => {
		command.handle(context, options)
	})
}

export const COMMANDS: Command[] = [CommandResetApp]
