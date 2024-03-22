import "./Main.css"
import {render} from "preact"
import {App} from "./App.js"

async function main() {
	const root = document.getElementById("root")!
	render(<App />, root)
}

main()
