import {createContext} from "preact"
import {useContext} from "preact/hooks"
import {CommandPalette} from "./CommandPalette.js"
import {AppState} from "./Main.js"
import {NoteList, NoteView} from "./NoteView.js"
import {WithChildren} from "./util/ReactUtil.js"

export interface AppContext {
	state: AppState
}

const AppContext = createContext<AppContext>(null!)

export function useAppContext(): AppContext {
	return useContext(AppContext)
}

export const App = ({context}: {context: AppContext}) => {
	return (
		<AppContext.Provider value={context}>
			<AppLayout>
				<Viewport />
				<CommandPalette />
			</AppLayout>
		</AppContext.Provider>
	)
}

interface AppLayoutProps extends WithChildren {}
const AppLayout = ({children}: AppLayoutProps) => {
	return <div className="AppLayout">{children}</div>
}

const Viewport = () => {
	const context = useAppContext()

	function renderCurrentView() {
		const currentNote = context.state.currentNote.value
		if (currentNote) {
			return (
				<>
					<section className="PrimarySidebar Panel">
						<NoteList />
					</section>
					<NoteView note={currentNote} />
				</>
			)
		}
		return null
	}

	return <section className="Viewport">{renderCurrentView()}</section>
}
