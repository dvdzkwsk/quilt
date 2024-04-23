import * as ReactDOM from "react-dom/client"
import {App, createAppContext} from "./App.js"
import {injectThemeUtilities, setTheme} from "./themes/ThemeUtil.js"
import {DEBUG_CommandOpenKitchenSinkNote, runCommand} from "./Commands.js"

async function main() {
	const context = createAppContext()
	injectThemeUtilities()
	setTheme(context, context.settings.theme)
	runCommand(context, DEBUG_CommandOpenKitchenSinkNote)

	const root = ReactDOM.createRoot(document.getElementById("root")!)
	root.render(<App context={context} />)
}

main()
