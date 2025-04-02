export function toError(rawError: unknown): Error {
	if (rawError instanceof Error) {
		return rawError
	} else if (typeof rawError === "string") {
		const error = new Error(rawError)
		return error
	} else {
		const error = new Error("unknown error")
		error.cause = rawError
		return error
	}
}
