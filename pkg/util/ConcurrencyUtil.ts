interface DebounceOptions {
	ms: number
}
export function debounce(fn: () => void, options: DebounceOptions) {
	let timeout: Timer
	return () => {
		clearTimeout(timeout)
		timeout = setTimeout(() => fn(), options.ms)
	}
}

interface DebounceOptions {
	ms: number
}
export function debounceAsync(fn: () => void, options: DebounceOptions) {
	let timeout: Timer
	let isRunningFn = false
	let needsTrailingCall = false

	const debounced = () => {
		if (isRunningFn) {
			needsTrailingCall = true
			return
		}
		clearTimeout(timeout)
		timeout = setTimeout(async () => {
			isRunningFn = true
			try {
				await fn()
			} finally {
				isRunningFn = false
				// TODO(david): more accurately, this should check the difference between now() and when fn() started
				// to see if we can skip the debounce.
				if (needsTrailingCall) {
					debounced()
				}
			}
		}, options.ms)
	}
	return debounced
}
