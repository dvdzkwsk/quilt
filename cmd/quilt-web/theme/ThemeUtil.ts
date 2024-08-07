import {effect} from "@preact/signals"
import {AppContext} from "../App.js"

export interface Theme {
	name: string
	tokens: {
		bgPrimary: string
		bgSecondary: string
		bgFocus: string
		bgActive: string
		bgPrimaryBorder: string
		bgSecondaryBorder: string
		focusOutline: string
	}
}

export const ThemeUtil = {
	spacing: {
		"1": "2px",
		"2": "4px",
		"3": "8px",
		"4": "12px",
		"5": "16px",
		"6": "24px",
	},
	bg(variant: "primary" | "secondary") {
		return variant === "primary" ? `var(--bgPrimary)` : `var(--bgSecondary)`
	},
} as const

const INJECTED_THEMES = new Set<string>()

export function initTheming(context: AppContext) {
	injectThemeUtilities()
	effect(() => {
		const currentTheme = context.settings.theme.value
		injectThemeAsStylesheet(currentTheme)
		document.documentElement.setAttribute("data-theme", currentTheme.name)
	})
}

function injectThemeAsStylesheet(theme: Theme) {
	if (INJECTED_THEMES.has(theme.name)) {
		return
	}
	const sheet = new CSSStyleSheet()
	let css = ""
	css += `[data-theme="${theme.name}"] {\n`
	for (const [tokenName, tokenValue] of Object.entries(theme.tokens)) {
		css += `--${tokenName}: ${tokenValue};\n`
	}
	css += `}`
	sheet.replaceSync(css)
	document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet]
	INJECTED_THEMES.add(theme.name)
}

function injectThemeUtilities() {
	const sheet = new CSSStyleSheet()
	let css = ":root {\n"
	for (const [key, value] of Object.entries(ThemeUtil.spacing)) {
		css += ` --spacing-${key}: ${value};\n`
	}
	css += "}"
	sheet.replaceSync(css)
	document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet]
}
