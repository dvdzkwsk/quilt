export function cx(...classes: any[]): string {
	return classes.filter((c) => !!c).join(" ")
}
