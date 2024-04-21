import "./CommandPalette.css"
import * as React from "react"
import {COMMANDS, Command, runCommand} from "../Commands.js"
import {useAppContext} from "../App.js"
import {List, ListApi} from "./List.js"

export const CommandPalette = () => {
	const context = useAppContext()
	if (!context.state.showCommandPalette.value) {
		return null
	}
	return (
		<CommandPaletteImpl
			onClose={() => {
				context.state.showCommandPalette.value = false
			}}
		/>
	)
}

interface CommandPaletteImplProps {
	onClose(): void
}
const CommandPaletteImpl = ({onClose}: CommandPaletteImplProps) => {
	const context = useAppContext()
	const modalRef = React.useRef<HTMLDivElement>(null!)
	const inputRef = React.useRef<HTMLInputElement>(null!)
	const listApiRef = React.useRef<ListApi<Command>>(null!)
	const [searchText, setSearchText] = React.useState("")
	const filteredCommands = React.useMemo((): Command[] => {
		return COMMANDS
	}, [COMMANDS, searchText])

	React.useEffect(() => {
		inputRef.current?.focus()
	}, [])

	React.useEffect(() => {
		function handleClick(e: MouseEvent) {
			if (!modalRef.current?.contains(e.target as any)) {
				onClose()
			}
		}
		function handleKeydown(e: KeyboardEvent) {
			if (e.key === "Escape") {
				onClose()
			}
		}
		document.addEventListener("click", handleClick)
		document.addEventListener("keydown", handleKeydown)
		return () => {
			document.removeEventListener("click", handleClick)
			document.removeEventListener("keydown", handleKeydown)
		}
	}, [onClose])

	return (
		<div className="CommandPalette">
			<div className="CommandPaletteModal" ref={modalRef}>
				<input
					ref={inputRef}
					className="CommandPaletteInput"
					value={searchText}
					onChange={(e) => {
						setSearchText(e.currentTarget.value)
					}}
				/>
				<List
					apiRef={listApiRef}
					items={filteredCommands}
					renderItem={(command) => {
						return (
							<div
								key={command.name}
								className="CommandPaletteMenuItem"
							>
								{command.name}
							</div>
						)
					}}
					onConfirmItem={(command) => {
						runCommand(context, command, {})
					}}
				/>
			</div>
		</div>
	)
}
