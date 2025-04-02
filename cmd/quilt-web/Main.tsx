import * as ReactDOM from "react-dom/client"
import {App} from "./App.js"

async function main() {
	const root = ReactDOM.createRoot(document.getElementById("root")!)
	root.render(<App />)
}

main()
