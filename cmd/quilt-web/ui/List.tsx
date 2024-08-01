import "./List.css"
import * as React from "react"
import {cx, useForceUpdate} from "@pkg/util/ReactUtil.js"

export interface ListProps<T> {
	items: T[]
	focusZoneRef?: React.MutableRefObject<HTMLDivElement | null>
	autoFocusFirstItem?: boolean
	renderItem(item: T): React.ReactNode
	onConfirmItem(item: T): void
}

export const List = <T,>({
	items,
	renderItem,
	onConfirmItem,
	autoFocusFirstItem,
	focusZoneRef,
}: ListProps<T>) => {
	const forceUpdate = useForceUpdate()
	const listRef = React.useRef<HTMLDivElement>(null!)
	const itemsRef = React.useRef<T[]>(items)
	const focusedItemRef = React.useRef<T | null>(null)

	React.useEffect(() => {
		focusedItemRef.current = null
		if (autoFocusFirstItem) {
			focusedItemRef.current = items[0]
			forceUpdate()
		}
	}, [items, autoFocusFirstItem])

	React.useEffect(() => {
		const focusZone = focusZoneRef?.current ?? listRef.current

		const handleKeydown = (e: KeyboardEvent) => {
			if (e.key === "Enter") {
				const item = focusedItemRef.current ?? itemsRef.current[0]
				if (item) {
					onConfirmItem(item)
				}
				return
			}
			let dy = 0
			if (e.key === "ArrowUp") {
				dy = -1
			} else if (e.key === "ArrowDown") {
				dy = 1
			}
			if (dy !== 0) {
				let index = itemsRef.current.indexOf(focusedItemRef.current!)
				index += dy
				const max = items.length - 1
				if (index > max) {
					index = 0
				} else if (index < 0) {
					index = max
				}
				focusedItemRef.current = itemsRef.current[index]
				forceUpdate()
			}
		}
		focusZone.addEventListener("keydown", handleKeydown)
		return () => {
			focusZone.removeEventListener("keydown", handleKeydown)
		}
	}, [listRef])

	return (
		<div className="List" ref={listRef}>
			{items.map((item, index) => {
				const focused = item === focusedItemRef.current
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
						className={cx(
							"ListItem",
							cx(focused && "ListItem-focus"),
						)}
					>
						{renderItem(item)}
					</div>
				)
			})}
		</div>
	)
}
