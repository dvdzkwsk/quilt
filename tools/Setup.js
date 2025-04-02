import cp from "child_process"
import fs from "fs"

let didFreshNodeModulesInstall = false

async function main() {
	await check("ensureNodeVersion", ensureNodeVersion())
	await check("ensureBunInstalled", ensureBunInstalled())
	await check("ensureNodeModulesInstalled", ensureNodeModulesInstalled())
	await check("ensureNodeModulesUpToDate", ensureNodeModulesUpToDate())

	console.info(`
Setup complete :)

Here are a few commands to get you started:

  # run the web app:
  $ bun quilt-web --dev

  # run the desktop app:
  $ bun quilt-web --dev      # run this in the background
  $ bun quilt-server --dev   # build and launch the electron app
`)
}

async function check(name, promise) {
	const FAIL_STR = "FAIL"
	const PASS_STR = "  OK"

	try {
		await promise
		console.info(`. ${PASS_STR} ${name}`)
	} catch (e) {
		console.error(e)
		console.error(`. ${FAIL_STR} ${name}`)
		process.exit(1)
	}
}

async function ensureNodeVersion() {
	const packageJson = JSON.parse(await fs.promises.readFile("package.json"))
	const minimumVersion = packageJson.engines.node
	let version = ""
	try {
		const stdout = cp.execSync("node -v")
		version = String(stdout).replace("\n", "").replace(/^v/, "")
	} catch (e) {
		console.error(e)
		throw e
	}
	if (!meetsMinimumVersion(minimumVersion, version)) {
		console.error("Dependency below minimum version: node")
		console.error("Minimum Version: %s", minimumVersion)
		console.error("   Your Version: %s", version)
		throw new Error()
	}
}

async function ensureBunInstalled() {
	const minimumVersion = "1.0.33"
	let version = ""
	try {
		const stdout = cp.execSync("bun -v")
		version = String(stdout).replace("\n", "")
	} catch (e) {
		console.error("Missing required dependency: bun")
		console.error("Install it here: https://bun.sh/docs/installation")
		throw e
	}
	if (!meetsMinimumVersion(minimumVersion, version)) {
		console.error("Dependency below minimum version: bun")
		console.error("Minimum Version: %s", minimumVersion)
		console.error("   Your Version: %s", version)
		console.error()
		console.error("Install it here: https://bun.sh/docs/installation")
		throw new Error()
	}
}

async function ensureNodeModulesInstalled() {
	if (!fs.existsSync("node_modules")) {
		didFreshNodeModulesInstall = true
		cp.execSync("bun install", {stdio: "inherit"})
	}
}

async function ensureNodeModulesUpToDate() {
	if (didFreshNodeModulesInstall) return

	cp.execSync("bun install", {stdio: "inherit"})
}

// less naïve semver check
function meetsMinimumVersion(minimumVersion, version) {
	const parsedVersion = parseSemver(version)
	const parsedMinimumVersion = parseSemver(minimumVersion)
	if (parsedVersion.major > parsedMinimumVersion.major) {
		return true
	} else if (parsedVersion.major === parsedMinimumVersion.major) {
		if (parsedVersion.minor > parsedMinimumVersion.minor) {
			return true
		} else if (parsedVersion.minor === parsedMinimumVersion.minor) {
			if (parsedVersion.patch >= parsedMinimumVersion.patch) {
				return true
			}
		}
	}
	return false
}

function parseSemver(version) {
	// naive semver parsing
	const [major, minor, patch] = version
		.split("-")[0]
		.split("=")
		.at(-1)
		.split(".")
	return {
		major: mustParseInt(major),
		minor: mustParseInt(minor),
		patch: mustParseInt(patch),
	}
}

function mustParseInt(str) {
	const num = Number.parseInt(str)
	if (!isFinite(num)) {
		throw new Error(`failed to parse integer from string: "${str}"`)
	}
	return num
}

main()
