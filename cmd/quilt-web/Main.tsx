import * as ReactDOM from "react-dom/client"
import {App, createAppContext} from "./App.js"
import {setTheme} from "./themes/ThemeUtil.js"

async function main() {
	const context = createAppContext()
	setTheme(context, context.settings.theme)

	const root = ReactDOM.createRoot(document.getElementById("root")!)
	root.render(<App context={context} />)
}

main()
