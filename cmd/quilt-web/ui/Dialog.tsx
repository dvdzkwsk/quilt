import "./Dialog.css"
import * as React from "react"
import {AppContext, useAppContext} from "../App.js"

export interface DialogProps {
	contentRef?: React.MutableRefObject<HTMLDivElement | null>
	children: React.ReactNode
	onClose(): void
}

export const DialogSpawner = () => {
	const context = useAppContext()

	const dialogContent = context.dialogContent.value
	if (!dialogContent) {
		return null
	}
	return (
		<Dialog
			onClose={() => {
				context.dialogContent.value = null
			}}
		>
			{dialogContent}
		</Dialog>
	)
}

export const Dialog = ({
	contentRef: _contentRef,
	onClose,
	children,
}: DialogProps) => {
	const onCloseRef = React.useRef<DialogProps["onClose"]>(onClose)
	onCloseRef.current = onClose
	const contentRef = React.useRef<HTMLDivElement | null>(null!)

	React.useEffect(() => {
		function handleClick(e: MouseEvent) {
			if (!contentRef.current?.contains(e.target as any)) {
				onCloseRef.current()
			}
		}
		function handleKeydown(e: KeyboardEvent) {
			if (e.key === "Escape") {
				onCloseRef.current()
			}
		}
		document.addEventListener("click", handleClick)
		document.addEventListener("keydown", handleKeydown)
		return () => {
			document.removeEventListener("click", handleClick)
			document.removeEventListener("keydown", handleKeydown)
		}
	}, [onCloseRef])

	return (
		<div className="Dialog">
			<div
				className="DialogContent"
				ref={(node) => {
					contentRef.current = node
					if (_contentRef) {
						_contentRef.current = node
					}
				}}
			>
				{children}
			</div>
		</div>
	)
}

export function openDialog(context: AppContext, content: React.ReactNode) {
	context.dialogContent.value = content
}
