import {Theme} from "./ThemeUtil.js"

export const ThemeQuiltLight = {
	name: "Quilt Light",
	tokens: {
		bgPrimary: "#fff",
		bgSecondary: "rgb(248, 250, 252)",
		bgActive: "rgb(203 213 225)",
		bgFocus: "rgb(241 245 249)",
		bgPrimaryBorder: "rgb(226 232 240)",
		bgSecondaryBorder: "rgb(226 232 240)",
		focusOutline: "rgb(2 132 199)",
	},
} as const satisfies Theme
