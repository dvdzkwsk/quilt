import * as React from "react"
import {cx} from "@pkg/util/ReactUtil.js"

export interface ListApi<T> {
	getFocusedItem(): T | null
}

interface ListProps<T> {
	items: T[]
	renderItem(item: T, focused: boolean): React.ReactNode
	onConfirmItem(item: T, detail: {focus: boolean}): void
	selectable?: boolean
	apiRef: React.MutableRefObject<ListApi<T>>
}
export const List = <T,>({
	items,
	renderItem,
	selectable,
	onConfirmItem,
}: ListProps<T>) => {
	const listRef = React.useRef<HTMLDivElement>(null!)
	const [focusedIndex, setFocusedIndex] = React.useState(0)
	const focusedItemRef = React.useRef(items[focusedIndex])
	focusedItemRef.current = items[focusedIndex]

	React.useEffect(() => {
		if (!listRef.current) return

		const handleKeydown = (e: KeyboardEvent) => {
			if (e.key === "Enter") {
				if (!selectable) {
					e.preventDefault()
					const item = focusedItemRef.current
					if (item) {
						onConfirmItem(item, {focus: true})
					}
					return
				}
			}
			let dy = 0
			if (e.key === "ArrowUp") {
				dy = -1
			} else if (e.key === "ArrowDown") {
				dy = 1
			}
			if (dy !== 0) {
				setFocusedIndex((prev) => {
					let nextFocusedIndex = prev + dy
					const max = items.length - 1
					if (nextFocusedIndex > max) {
						nextFocusedIndex = 0
					} else if (nextFocusedIndex < 0) {
						nextFocusedIndex = max
					}
					return nextFocusedIndex
				})
			}
		}
		listRef.current.addEventListener("keydown", handleKeydown)
		return () => {
			listRef.current.removeEventListener("keydown", handleKeydown)
		}
	}, [listRef])

	return (
		<div className="List" ref={listRef}>
			{items.map((item, index) => {
				const focused = index === focusedIndex
				return (
					<div
						role="treeitem"
						data-index={undefined} // TODO
						data-last-element={undefined} // TODO
						data-last-parity={undefined} // TODO
						aria-setsize={undefined} // TODO
						aria-posinset={undefined} // TODO
						aria-selected={undefined} // TOOD
						aria-level={undefined} // TOOD
						aria-label={undefined} // TOOD
						aria-expanded={undefined} // TOOD
						className={cx("ListItem", cx(focused && "focus"))}
						onClick={() => {
							onConfirmItem(item, {focus: false})
						}}
					>
						{renderItem(item, focused)}
					</div>
				)
			})}
		</div>
	)
}
