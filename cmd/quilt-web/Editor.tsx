import * as React from "react"
import {Signal} from "@preact/signals"
import {Editor} from "@tiptap/core"
import StarterKit from "@tiptap/starter-kit"
import {unified} from "unified"
import rehypeSanitize from "rehype-sanitize"
import rehypeStringify from "rehype-stringify"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import {Flex} from "./ui/Primitives.js"

export interface Note {
	content: string
	tags: Signal<Tag[]>
	todos: Signal<Todo[]>
}

export interface Tag {
	id: string
	name: string
}

export interface Todo {
	id: string
	content: string
	completedAt: Date | null
}

export const WELCOME_CONTENT = `# Welcome to Quilt!`

export const KITCHEN_SINK_CONTENT = `# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5

This is a paragraph followed by a horizontal rule.

---

- Unordered list 1
- Unordered list 2
- Unordered list 3

1. Ordered list 1
2. Ordered list 2
3. Ordered list 3`

interface NoteEditorProps {
	note: Note
}
export const NoteEditor = ({note}: NoteEditorProps) => {
	const editorElementRef = React.useRef<HTMLDivElement | null>(null)
	const editorRef = React.useRef<Editor | null>(null)

	React.useEffect(() => {
		const element = editorElementRef.current
		if (!editorRef.current && element) {
			const editor = new Editor({
				element,
				extensions: [StarterKit],
				content: "<p>Hello World!</p>",
			})
			editorRef.current = editor
		}
	}, [editorElementRef, editorRef])

	React.useEffect(() => {
		const editor = editorRef.current
		if (!editor) {
			return
		}
		const result = unified()
			.use(remarkParse)
			.use(remarkRehype)
			.use(rehypeSanitize)
			.use(rehypeStringify)
			.processSync(note.content)
		editor.commands.setContent(result.toString())
	}, [note])

	return (
		<div className="NoteView">
			<div className="NoteEditor" ref={editorElementRef}></div>
			<section className="NoteSidebar">
				<SidebarSection title="Tags">
					<Flex wrap gap={8}>
						{note.tags.value.map((tag) => {
							return (
								<span key={tag.id} className="Tag">
									#{tag.name}
								</span>
							)
						})}
					</Flex>
				</SidebarSection>
				<SidebarSection title="Todos">
					<div className="TodoList">
						{note.todos.value.map((todo) => {
							const id = `Todo-${todo.id}`
							return (
								<span key={todo.id} className="Todo">
									<input type="checkbox" id={id} />
									<span>{todo.content}</span>
								</span>
							)
						})}
					</div>
				</SidebarSection>
			</section>
		</div>
	)
}

interface SidebarSectionProps {
	title: string
	children: React.ReactNode
}
const SidebarSection = ({title, children}: SidebarSectionProps) => {
	return (
		<div className="SidebarSection">
			<Flex>
				<h2 style={{flex: 1}}>{title}</h2>
				<div style={{flexShrink: 0}}>
					<button>+</button>
				</div>
			</Flex>
			{children}
		</div>
	)
}
