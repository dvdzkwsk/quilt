import {toError} from "@pkg/util/ErrorUtil.js"

const LOG_LEVELS = ["debug", "info", "warn", "error", "fatal"] as const

export type LogLevel = (typeof LOG_LEVELS)[number]

interface LogMessage {
	level: LogLevel

	/** The most broad context of this error (usually the file name) */
	context: string

	/** The most narrow context of this error (usually the nearest function name) */
	subcontext: string

	message: string

	/** Auxilliary information about this error. */
	aux: Partial<LogMessageAux>
}

interface LogMessageAux {
	error: Error
	profile: {
		checkpoint: string
	}
	other: Record<string, unknown>
}

export class Logger {
	context: string
	constructor(context: string) {
		this.context = context
	}

	log(message: LogMessage) {
		// TODO(david): transports
		if (message.level === "error" || message.level === "fatal") {
			console.error(
				"[%s.%s] %s",
				message.context,
				message.subcontext,
				message.message,
				...(message.aux ? [message.aux] : []),
			)
		} else if (message.level === "warn") {
			console.warn(
				"[%s.%s] %s",
				message.context,
				message.subcontext,
				message.message,
				...(message.aux ? [message.aux] : []),
			)
		} else if (message.level === "info") {
			console.info(
				"[%s.%s] %s",
				message.context,
				message.subcontext,
				message.message,
				...(message.aux ? [message.aux] : []),
			)
		} else {
			console.debug(
				"[%s.%s] %s",
				message.context,
				message.subcontext,
				message.message,
				...(message.aux ? [message.aux] : []),
			)
		}
	}

	logWithLevel(
		level: LogLevel,
		subcontext: string,
		message: string,
		aux?: LogMessageAux,
	) {
		this.log({
			level,
			context: this.context,
			subcontext,
			message,
			aux: aux || {},
		})
	}

	debug(subcontext: string, message: string, aux?: LogMessageAux) {
		this.logWithLevel("debug", subcontext, message, aux)
	}

	info(subcontext: string, message: string, aux?: LogMessageAux) {
		this.logWithLevel("info", subcontext, message, aux)
	}

	warn(subcontext: string, message: string, aux?: LogMessageAux) {
		this.logWithLevel("warn", subcontext, message, aux)
	}

	error(subcontext: string, message: string, aux?: LogMessageAux) {
		this.logWithLevel("error", subcontext, message, aux)
	}

	fatal(subcontext: string, message: string, aux?: LogMessageAux) {
		this.logWithLevel("fatal", subcontext, message, aux)
	}

	async profile<T>(
		subcontext: string,
		message: string,
		aux: LogMessageAux,
		fn: () => Promise<T>,
	): Promise<T> {
		const level: LogLevel = "debug"
		this.logWithLevel(level, subcontext, message, {
			...aux,
			profile: {checkpoint: "start"},
		})
		try {
			const result = await fn()
			this.logWithLevel(level, subcontext, message, {
				...aux,
				profile: {checkpoint: "success"},
			})
			return result
		} catch (error) {
			this.logWithLevel(level, subcontext, message, {
				...aux,
				error: toError(error),
				profile: {checkpoint: "error"},
			})
			throw error
		} finally {
			this.logWithLevel(level, subcontext, message, {
				...aux,
				profile: {checkpoint: "done"},
			})
		}
	}

	newError(subcontext: string, message: string, aux?: LogMessageAux) {
		const error = new Error(message)
		this.log({
			level: "fatal",
			context: this.context,
			subcontext,
			message,
			aux: {
				...aux,
				error,
			},
		})
		return new Error(message)
	}
}
