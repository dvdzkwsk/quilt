import "./App.css"
import * as React from "react"
import {Signal, signal} from "@preact/signals"
import {CommandPalette} from "./ui/CommandPalette.js"
import {Theme} from "./themes/ThemeUtil.js"
import {ThemeQuiltLight} from "./themes/ThemeQuiltLight.js"

const AppContext = React.createContext<AppContext>(null!)

export interface AppContext {
	state: {
		showCommandPalette: Signal<boolean>
	}
	settings: {
		theme: Theme
	}
}
export function createAppContext(): AppContext {
	return {
		state: {
			showCommandPalette: signal(false),
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
	return (
		<AppContext.Provider value={context}>
			<div className="AppLayout">
				<div className="AppViewport">
					<h1>Hello Quilt</h1>
				</div>
				<div className="AppFooter"></div>
			</div>
			<CommandPalette />
		</AppContext.Provider>
	)
}
