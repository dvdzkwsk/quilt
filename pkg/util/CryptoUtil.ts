export function uuid(prefix: string) {
	return `${prefix}_${crypto.randomUUID().slice(2)}`
}
