import "./App.css"
import * as React from "react"
import {Signal, signal} from "@preact/signals"
import {Theme} from "./theme/ThemeUtil.js"
import {ThemeQuiltLight} from "./theme/ThemeQuiltLight.js"
import {SpotlightSpawner} from "./ui/Spotlight.js"
import {Panel} from "./ui/Panel.js"
import {DialogSpawner} from "./ui/Dialog.js"

const AppContext = React.createContext<AppContext>(null!)

export interface AppContext {
	dialogContent: Signal<React.ReactNode | null>
	showSpotlight: Signal<boolean>
	settings: {
		theme: Signal<Theme>
	}
}
export function createAppContext(): AppContext {
	return {
		dialogContent: signal(null),
		showSpotlight: signal(false),
		settings: {
			theme: signal(ThemeQuiltLight),
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
				<div className="AppBody">
					<PrimarySidebar />
					<Viewport />
					<SecondarySidebar />
				</div>
				<div className="AppFooter"></div>
			</div>
			<SpotlightSpawner />
			<DialogSpawner />
		</AppContext.Provider>
	)
}

const PrimarySidebar = () => {
	return (
		<Panel id="PrimarySidebar" className="Panel-secondary Panel-left">
			Primary Sidebar
		</Panel>
	)
}

const SecondarySidebar = () => {
	return (
		<Panel id="SecondarySidebar" className="Panel-secondary Panel-right">
			Secondary Sidebar
		</Panel>
	)
}

const Viewport = () => {
	return (
		<Panel id="Viewport" flex>
			<div>Open a note to start editing.</div>
		</Panel>
	)
}
