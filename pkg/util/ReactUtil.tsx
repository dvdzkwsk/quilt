import React from "react"

export function cx(...classes: any[]): string {
	return classes.filter((c) => !!c).join(" ")
}

export function useForceUpdate() {
	const [, setState] = React.useState(0)
	return React.useCallback(() => {
		setState((old) => old + 1)
	}, [])
}
