import {render} from "preact"
import {Signal, signal} from "@preact/signals"
import {App, AppContext} from "./App.js"
import {Note, createNote} from "./Model.js"
import {CommandCreateNote, runCommand} from "./Commands.js"

export interface AppState {
	notes: Signal<Note[]>
	currentNote: Signal<Note | null>
	showCommandPalette: Signal<boolean>
}

async function main() {
	const state = getInitialAppState()
	const context: AppContext = {
		state,
	}
	const root = document.getElementById("root")!
	render(<App context={context} />, root)

	function checkForKeyboardShortcut(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === "k") {
			e.preventDefault()
			context.state.showCommandPalette.value = true
		} else if ((e.ctrlKey || e.metaKey) && e.key === "n") {
			runCommand(CommandCreateNote, {}, context)
		}
	}

	document.addEventListener("keydown", checkForKeyboardShortcut)
}

function getInitialAppState(): AppState {
	const state: AppState = {
		notes: signal([]),
		currentNote: signal(null),
		showCommandPalette: signal(false),
	}

	const defaultNote = createNote()
	defaultNote.name.value = "Journal"

	state.notes.value = [defaultNote]
	state.currentNote.value = defaultNote

	return state
}

main()
