import "./Spotlight.css"
import * as React from "react"
import {COMMANDS, Command, runCommand} from "../Commands.js"
import {useAppContext} from "../App.js"
import {Dialog} from "./Dialog.js"
import {List} from "./List.js"
import {Input} from "./Form.js"

export const SpotlightSpawner = () => {
	const context = useAppContext()

	React.useEffect(() => {
		const handleKeydown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				context.showSpotlight.value = !context.showSpotlight.value
			}
		}
		document.addEventListener("keydown", handleKeydown)
		return () => {
			document.removeEventListener("keydown", handleKeydown)
		}
	}, [context])

	if (!context.showSpotlight.value) {
		return null
	}
	return (
		<Spotlight
			onClose={() => {
				context.showSpotlight.value = false
			}}
		/>
	)
}

interface SpotlightProps {
	onClose(): void
}
const Spotlight = ({onClose}: SpotlightProps) => {
	const context = useAppContext()
	const dialogContentRef = React.useRef<HTMLDivElement | null>(null)
	const [searchText, setSearchText] = React.useState("")
	const filteredCommands = React.useMemo((): Command[] => {
		const loweredSearchText = searchText.toLocaleLowerCase()
		return COMMANDS.filter((command) => {
			return (
				command.name.toLocaleLowerCase().includes(loweredSearchText) ||
				command.aliases?.some((alias) => {
					return alias.toLocaleLowerCase().includes(loweredSearchText)
				})
			)
		})
	}, [COMMANDS, searchText])

	return (
		<Dialog onClose={onClose} contentRef={dialogContentRef}>
			<div className="Spotlight">
				<Input
					autoFocus
					value={searchText}
					onChange={(e) => {
						setSearchText(e.currentTarget.value)
					}}
				/>
				<List
					focusZoneRef={dialogContentRef}
					items={filteredCommands}
					autoFocusFirstItem
					renderItem={(command) => {
						return <div>{command.name}</div>
					}}
					onConfirmItem={(command) => {
						context.showSpotlight.value = false
						runCommand(context, command)
					}}
				/>
			</div>
		</Dialog>
	)
}
