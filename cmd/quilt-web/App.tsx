import "./App.css"
import * as React from "react"
import {Signal, signal} from "@preact/signals"
import {Theme} from "./themes/ThemeUtil.js"
import {ThemeQuiltLight} from "./themes/ThemeQuiltLight.js"
import {CommandPalette} from "./ui/CommandPalette.js"
import {Note, NoteEditor} from "./Editor.js"

const AppContext = React.createContext<AppContext>(null!)

export interface AppContext {
	state: {
		activeNote: Signal<Note | null>
		showCommandPalette: Signal<boolean>
		zenMode: Signal<boolean>
	}
	settings: {
		theme: Theme
	}
}
export function createAppContext(): AppContext {
	return {
		state: {
			activeNote: signal(null),
			showCommandPalette: signal(false),
			zenMode: signal(false),
		},
		settings: {
			theme: ThemeQuiltLight,
		},
	}
}

export function useAppContext(): AppContext {
	return React.useContext(AppContext)
}

interface AppProps {
	context: AppContext
}
export const App = ({context}: AppProps) => {
	const zenMode = context.state.zenMode
	return (
		<AppContext.Provider value={context}>
			<div className="AppLayout">
				<div className="AppViewport">
					<ActiveNote />
				</div>
				{!zenMode && <div className="AppFooter"></div>}
			</div>
			<CommandPalette />
		</AppContext.Provider>
	)
}

const ActiveNote = () => {
	const context = useAppContext()
	const activeNote = context.state.activeNote.value
	if (!activeNote) {
		return null
	}
	return <NoteEditor note={activeNote} />
}
