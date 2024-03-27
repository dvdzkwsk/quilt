import "./CommandPalette.css"
import {useEffect, useMemo, useRef, useState} from "preact/hooks"
import {COMMANDS} from "./Commands.js"
import {fuzzySearch} from "./util/StringUtil.js"
import {useAppContext} from "./App.js"

export const CommandPalette = () => {
	const context = useAppContext()
	if (context.state.showCommandPalette.value) {
		return (
			<CommandPaletteImpl
				onClose={() => {
					context.state.showCommandPalette.value = false
				}}
			/>
		)
	}
	return null
}

interface CommandPaletteImplProps {
	onClose(): void
}
const CommandPaletteImpl = ({onClose}: CommandPaletteImplProps) => {
	const modalRef = useRef<HTMLDivElement>(null)
	const [searchValue, setSearchValue] = useState("")
	const filteredCommands = useMemo(() => {
		return fuzzySearch(COMMANDS, searchValue, {
			getSearchText(item) {
				return item.name
			},
		})
	}, [COMMANDS, searchValue])

	function doSubmit() {
		const trimmed = searchValue.trim()
		if (trimmed[0] === "/") {
			executeSlashCommand(trimmed)
		}
	}

	useEffect(() => {
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
					className="CommandPaletteInput"
					value={searchValue}
					onChange={(e) => setSearchValue(e.currentTarget.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault()
							doSubmit()
						}
					}}
				/>
				<div className="CommandPaletteMenu">
					{filteredCommands.map((command) => {
						return (
							<div
								key={command.name}
								className="CommandPaletteMenuItem"
							>
								{command.name}
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)
}

function executeSlashCommand(input: string) {
	// TODO: dev console style slash commands (e.g. `/create-note "hello world" +foo +bar`)
}
