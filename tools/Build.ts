import * as fs from "fs"
import * as path from "path"
import * as esbuild from "esbuild"
import alias from "esbuild-plugin-alias"

async function main() {
	const args = process.argv.slice(2)

	switch (args[0]) {
		case "quilt-cli":
			await import("../cmd/quilt-cli/Main.js")
			break
		case "quilt-web":
			await buildWebApp("./cmd/quilt-web")
			break
		default:
			console.error("unknown arguments", args)
			process.exit(1)
	}
}

async function buildWebApp(cwd: string) {
	const buildOptions: esbuild.BuildOptions = {
		entryPoints: [path.join(cwd, "Main.tsx")],
		outdir: path.resolve(cwd, "static/dist"),
		assetNames: "[name]",
		entryNames: "[name]",
		bundle: true,
		format: "esm",
		platform: "browser",
		target: "esnext",
		plugins: [await esbuildPluginPreact()],
		sourcemap: "linked",
		define: {
			"process.env.NODE_ENV": JSON.stringify(
				process.env.NODE_ENV || "development",
			),
		},
	}

	if (buildOptions.outdir && fs.existsSync(buildOptions.outdir)) {
		fs.rmSync(buildOptions.outdir, {recursive: true, force: true})
	}

	if (process.argv.includes("--dev")) {
		const esbuildContext = await esbuild.context(buildOptions)
		const esbuildServeOptions: esbuild.ServeOptions = {
			port: 3000,
			servedir: path.join(cwd, "static"),
			fallback: path.join(cwd, "static/index.html"),
		}
		const server = await esbuildContext.serve(esbuildServeOptions)
		console.info(`server running at: http://localhost:${server.port}`)
	} else {
		buildOptions.metafile = true
		const result = await esbuild.build(buildOptions)
		if (result.metafile) {
			const analysis = await esbuild.analyzeMetafile(result.metafile)
			console.info(analysis)
		}
	}
}

export async function esbuildPluginPreact() {
	return alias({
		react: await import.meta.resolve("preact/compat"),
		"react-dom": await import.meta.resolve("preact/compat"),
		"react-dom/client": await import.meta.resolve("preact/compat/client"),
		"react/jsx-runtime": await import.meta.resolve("preact/jsx-runtime"),
	})
}

main()
