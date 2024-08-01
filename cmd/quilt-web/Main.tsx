import * as ReactDOM from "react-dom/client"
import {App, createAppContext} from "./App.js"
import {initTheming} from "./theme/ThemeUtil.js"

async function main() {
	const context = createAppContext()
	initTheming(context)

	const root = ReactDOM.createRoot(document.getElementById("root")!)
	root.render(<App context={context} />)
}

main()
