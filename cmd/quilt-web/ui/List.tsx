import * as React from "react"
import {cx} from "@pkg/util/ReactUtil.js"

interface ListProps<T> {
	items: T[]
	renderItem(item: T): React.ReactNode
}
export const List = <T,>({items, renderItem}: ListProps<T>) => {
	const listRef = React.useRef<HTMLDivElement>(null!)
	const [focusedItem, setFocusedItem] = React.useState<T | null>(null)
	const itemsRef = React.useRef<T[]>(items)
	const focusedItemRef = React.useRef(focusedItem)
	focusedItemRef.current = focusedItem

	React.useEffect(() => {
		if (!listRef.current) return

		const handleKeydown = (e: KeyboardEvent) => {
			let dy = 0
			if (e.key === "ArrowUp") {
				dy = -1
			} else if (e.key === "ArrowDown") {
				dy = 1
			}
			if (dy !== 0) {
				setFocusedItem((item) => {
					let index = itemsRef.current.indexOf(item!)
					index += dy
					const max = items.length - 1
					if (index > max) {
						index = 0
					} else if (index < 0) {
						index = max
					}
					return itemsRef.current[index]
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
				const focused = index === focusedItem
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
					>
						{renderItem(item)}
					</div>
				)
			})}
		</div>
	)
}
