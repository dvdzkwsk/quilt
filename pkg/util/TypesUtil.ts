import {Signal} from "@preact/signals"

export type Serialized<T> =
	T extends Signal<infer V>
		? V
		: T extends Date
			? string
			: T extends Array<infer V>
				? Array<Serialized<V>>
				: T extends object
					? {
							[K in keyof T]: Serialized<T[K]>
						}
					: T
