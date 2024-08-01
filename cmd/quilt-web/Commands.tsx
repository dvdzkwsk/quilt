import {AppContext} from "./App.js"
import {batch} from "@preact/signals"
import {openDialog} from "./ui/Dialog.js"
import {Input} from "./ui/Form.js"

interface CommandContext extends AppContext {}

export interface Command<TOptions extends object = any> {
	name: string
	aliases?: string[]
	handle(context: CommandContext, options: TOptions): any
}

type CommandOptions<T extends Command> = Parameters<
	T["handle"]
>[1] extends object
	? Parameters<T["handle"]>[1]
	: {}

export const CommandCreateNote = {
	name: "New Note",
	aliases: ["Create Note"],
	async handle(context) {},
} satisfies Command

export const CommandCreateTodo = {
	name: "New Todo",
	aliases: ["Create Todo"],
	async handle(context) {
		openDialog(context, <TodoDialogContent />)
	},
} satisfies Command

const TodoDialogContent = () => {
	return (
		<div>
			<Input placeholder="Your todo..." autoFocus />
		</div>
	)
}

export const DEBUG_CommandResetApp = {
	name: "DEBUG: Reset App",
	async handle(context) {},
} satisfies Command

export function runCommand<T extends Command>(
	context: CommandContext,
	command: T,
	options?: CommandOptions<T>,
): void {
	batch(() => {
		command.handle(context, options)
	})
}

const DEBUG_COMMANDS: Command[] = [DEBUG_CommandResetApp]

export const COMMANDS: Command[] = [
	CommandCreateNote,
	CommandCreateTodo,
	...DEBUG_COMMANDS,
].sort((a, b) => {
	return a.name.localeCompare(b.name)
})
