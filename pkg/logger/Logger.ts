const LOG_LEVELS = ["debug", "info", "warn", "error", "fatal"] as const

export type LogLevel = (typeof LOG_LEVELS)[number]

interface LogMessage {
	level: LogLevel
	context: string
	subcontext: string
	message: string
	detail: Record<string, unknown> | undefined
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
				...(message.detail ? [message.detail] : []),
			)
		} else if (message.level === "warn") {
			console.warn(
				"[%s.%s] %s",
				message.context,
				message.subcontext,
				message.message,
				...(message.detail ? [message.detail] : []),
			)
		} else if (message.level === "info") {
			console.info(
				"[%s.%s] %s",
				message.context,
				message.subcontext,
				message.message,
				...(message.detail ? [message.detail] : []),
			)
		} else {
			console.debug(
				"[%s.%s] %s",
				message.context,
				message.subcontext,
				message.message,
				...(message.detail ? [message.detail] : []),
			)
		}
	}

	logWithLevel(
		level: LogLevel,
		subcontext: string,
		message: string,
		detail?: LogMessage["detail"],
	) {
		this.log({
			level,
			context: this.context,
			subcontext,
			message,
			detail,
		})
	}

	debug(subcontext: string, message: string, detail?: LogMessage["detail"]) {
		this.logWithLevel("debug", subcontext, message, detail)
	}

	info(subcontext: string, message: string, detail?: LogMessage["detail"]) {
		this.logWithLevel("info", subcontext, message, detail)
	}

	warn(subcontext: string, message: string, detail?: LogMessage["detail"]) {
		this.logWithLevel("warn", subcontext, message, detail)
	}

	error(subcontext: string, message: string, detail?: LogMessage["detail"]) {
		this.logWithLevel("error", subcontext, message, detail)
	}

	fatal(subcontext: string, message: string, detail?: LogMessage["detail"]) {
		this.logWithLevel("fatal", subcontext, message, detail)
	}

	async profile(
		subcontext: string,
		message: string,
		detail: LogMessage["detail"],
		fn: () => void,
	) {
		const level: LogLevel = "debug"
		this.logWithLevel(level, subcontext, message, {
			...detail,
			profile: "start",
		})
		try {
			await fn()
			this.logWithLevel(level, subcontext, message, {
				...detail,
				profile: "success",
			})
		} catch (error) {
			this.logWithLevel(level, subcontext, message, {
				...detail,
				error,
				profile: "error",
			})
			throw error
		} finally {
			this.logWithLevel(level, subcontext, message, {
				...detail,
				profile: "finish",
			})
		}
	}

	newError(
		subcontext: string,
		message: string,
		detail?: LogMessage["detail"],
	) {
		this.log({
			level: "fatal",
			context: this.context,
			subcontext,
			message,
			detail: detail ?? {},
		})
		return new Error(message)
	}
}
