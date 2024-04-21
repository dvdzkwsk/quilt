import express from "express"
import cors from "cors"

async function main() {
	const app = express()
	app.use(cors({origin: true}))
	app.use(express.json())

	const port = +(process.env["PORT"] || 8000)
	app.listen(port, () => {
		console.info(`server running at http://localhost:${port}`)
	})
}

main()
