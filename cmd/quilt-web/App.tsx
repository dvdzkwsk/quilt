import {ComponentChildren} from "preact"
import {Signal, batch, signal, useSignal} from "@preact/signals"
import {useEffect, useRef} from "preact/hooks"

interface Entity {
	id: string
	createdAt: Date
	modifiedAt: Date
}

interface Thread extends Entity {
	name: Signal<string>
	notes: Signal<Note[]>
}

interface Note extends Entity {
	text: Signal<string>
	tags: Signal<Tag[]>
}

interface Tag extends Entity {
	name: string
}

function createEntity(): Entity {
	const date = new Date()
	return {
		id: uuid(),
		createdAt: date,
		modifiedAt: date,
	}
}

function uuid(): string {
	return `${Date.now()}` // TODO
}

function createThread(): Thread {
	return {
		...createEntity(),
		name: signal(""),
		notes: signal([]),
	}
}

function createNote(): Note {
	return {
		...createEntity(),
		text: signal(""),
		tags: signal([]),
	}
}

function createTag(): Tag {
	return {
		...createEntity(),
		name: "",
	}
}

interface AppState {
	threads: Signal<Thread[]>
	currentThread: Signal<Thread | null>
}
const state: AppState = {
	threads: signal([]),
	currentThread: signal(null),
}

const defaultThread = createThread()
defaultThread.name.value = "Journal"

state.threads.value = [defaultThread]
state.currentThread.value = defaultThread

export const App = () => {
	return (
		<QuiltApp>
			<QuiltSidebar />
			<QuiltViewport />
		</QuiltApp>
	)
}

const QuiltApp = ({children}: {children: ComponentChildren}) => {
	return <div className="QuiltApp">{children}</div>
}

const QuiltSidebar = () => {
	return (
		<section className="QuiltSidebar">
			<QuiltThreadList />
		</section>
	)
}

const QuiltThreadList = () => {
	return null
}

const QuiltViewport = () => {
	const currentThread = state.currentThread.value
	return (
		<section className="QuiltViewport">
			{currentThread && <QuiltThreadView thread={currentThread} />}
		</section>
	)
}

const QuiltThreadView = ({thread}: {thread: Thread}) => {
	const focusedNote = useSignal<Note | null>(null)

	useEffect(() => {
		function handleKeydown(e: KeyboardEvent) {
			if ((e.ctrlKey || e.metaKey) && e.key === "n") {
				batch(() => {
					const note = createNote()
					thread.notes.value = [...thread.notes.value, note]
					focusedNote.value = note
				})
			}
		}
		document.addEventListener("keydown", handleKeydown)
		return () => {
			document.removeEventListener("keydown", handleKeydown)
		}
	}, [thread, focusedNote])

	return (
		<div className="QuiltThreadView">
			<h1>{thread.name}</h1>
			<div className="QuiltThreadNotes">
				{thread.notes.value.map((note) => {
					return (
						<QuiltNote
							key={note.id}
							note={note}
							focused={focusedNote.value === note}
						/>
					)
				})}
			</div>
		</div>
	)
}

const QuiltNote = ({note, focused}: {note: Note; focused: boolean}) => {
	const ref = useRef<HTMLDivElement | null>(null)
	useEffect(() => {
		if (ref.current && focused) {
			ref.current.querySelector("input")?.focus()
		}
	}, [focused])
	return (
		<div className="QuiltNote" data-note-id={note.id} ref={ref}>
			<input
				value={note.text}
				onChange={(e) => {
					note.text.value = e.currentTarget.value
				}}
			/>
		</div>
	)
}
