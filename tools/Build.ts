import * as cp from "child_process"
import * as fs from "fs"
import * as path from "path"
import * as esbuild from "esbuild"
import alias from "esbuild-plugin-alias"

async function main() {
	const args = process.argv.slice(2)
	const target = path.basename(args[0])
	switch (target) {
		case "quilt-web":
			await buildWebApp(`./cmd/${target}`)
			break
		case "quilt-chrome-extension":
			await buildElectronApp(`./cmd/${target}`)
			break
		default:
			await buildNodeApp(`./cmd/${target}`)
	}
}

function hasDevFlag(args: string[]) {
	return args.includes("--dev")
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
				process.env["NODE_ENV"] || hasDevFlag(process.argv)
					? "development"
					: "production",
			),
		},
	}

	if (buildOptions.outdir && fs.existsSync(buildOptions.outdir)) {
		fs.rmSync(buildOptions.outdir, {recursive: true, force: true})
	}

	if (hasDevFlag(process.argv)) {
		const esbuildContext = await esbuild.context(buildOptions)
		const esbuildServeOptions: esbuild.ServeOptions = {
			port: 3000,
			servedir: path.join(cwd, "static"),
			fallback: path.join(cwd, "static/index.html"),
		}
		const server = await esbuildContext.serve(esbuildServeOptions)
		console.info(`server running at: http://localhost:${server.port}`)
	} else {
		buildOptions.minify = true
		buildOptions.metafile = true
		const result = await esbuild.build(buildOptions)
		if (result.metafile) {
			const analysis = await esbuild.analyzeMetafile(result.metafile)
			console.info(analysis)
		}
	}
}

async function buildNodeApp(cwd: string) {
	const mainFile = path.join(cwd, "Main.ts")

	if (hasDevFlag(process.argv)) {
		await import(mainFile)
		return
	}

	const buildOptions: esbuild.BuildOptions = {
		entryPoints: [mainFile],
		outdir: path.resolve(cwd, "dist"),
		assetNames: "[name]",
		entryNames: "[name]",
		bundle: true,
		format: "esm",
		platform: "node",
		target: "esnext",
		sourcemap: "linked",
		define: {
			"process.env.NODE_ENV": JSON.stringify(
				process.env["NODE_ENV"] || hasDevFlag(process.argv)
					? "development"
					: "production",
			),
		},
	}
	if (buildOptions.outdir && fs.existsSync(buildOptions.outdir)) {
		fs.rmSync(buildOptions.outdir, {recursive: true, force: true})
	}
	buildOptions.minify = true
	buildOptions.metafile = true
	const result = await esbuild.build(buildOptions)
	if (result.metafile) {
		const analysis = await esbuild.analyzeMetafile(result.metafile)
		console.info(analysis)
	}
}

async function buildElectronApp(cwd: string) {
	const mainFile = path.join(cwd, "Main.ts")

	if (hasDevFlag(process.argv)) {
		cp.execSync(
			"bun quilt-desktop && npx electron ./cmd/quilt-desktop/dist/Main.cjs",
			{
				stdio: "inherit",
			},
		)
		return
	}

	const buildOptions: esbuild.BuildOptions = {
		entryPoints: [mainFile],
		outdir: path.resolve(cwd, "dist"),
		assetNames: "[name]",
		entryNames: "[name]",
		outExtension: {
			".js": ".cjs",
		},
		bundle: true,
		format: "cjs",
		platform: "node",
		target: "esnext",
		sourcemap: "linked",
		external: ["electron", "path", "fs"],
		define: {
			"process.env.NODE_ENV": JSON.stringify(
				process.env["NODE_ENV"] || hasDevFlag(process.argv)
					? "development"
					: "production",
			),
		},
	}
	if (buildOptions.outdir && fs.existsSync(buildOptions.outdir)) {
		fs.rmSync(buildOptions.outdir, {recursive: true, force: true})
	}
	buildOptions.minify = true
	buildOptions.metafile = true
	const result = await esbuild.build(buildOptions)
	if (result.metafile) {
		const analysis = await esbuild.analyzeMetafile(result.metafile)
		console.info(analysis)
	}
}

async function esbuildPluginPreact() {
	async function resolve(module: string) {
		const path = await import.meta.resolve(module)
		return path.replace("file://", "")
	}
	return alias({
		react: await resolve("preact/compat"),
		"react-dom": await resolve("preact/compat"),
		"react-dom/client": await resolve("preact/compat/client"),
		"react/jsx-runtime": await resolve("preact/jsx-runtime"),
	})
}

main()
