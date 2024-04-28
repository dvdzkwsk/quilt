import "./App.css"
import * as React from "react"
import {Signal, signal} from "@preact/signals"
import {Theme} from "./themes/ThemeUtil.js"
import {ThemeQuiltLight} from "./themes/ThemeQuiltLight.js"
import {CommandPalette} from "./ui/CommandPalette.js"
import {Note, NoteEditor} from "./Editor.js"
import {Panel} from "./ui/Primitives.js"

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
					{!zenMode && <PrimarySidebar />}
					<ActiveNote />
					{!zenMode && <SecondarySidebar />}
				</div>
				{!zenMode && <div className="AppFooter"></div>}
			</div>
			<CommandPalette />
		</AppContext.Provider>
	)
}

const PrimarySidebar = () => {
	return <Panel id="PrimarySidebar">PrimarySidebar</Panel>
}

const SecondarySidebar = () => {
	return <Panel id="SecondarySidebar">SecondarySidebar</Panel>
}

const ActiveNote = () => {
	const context = useAppContext()
	const id = `Editor-${React.useId()}`
	const activeNote = context.state.activeNote.value
	return (
		<Panel id={id}>
			{activeNote ? (
				<NoteEditor note={activeNote} />
			) : (
				<div>Open a note to start editing.</div>
			)}
		</Panel>
	)
}
