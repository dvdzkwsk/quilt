import "./NoteView.css"
import {Signal} from "@preact/signals"
import {Note, Todo} from "./Model.js"

export const NoteList = () => {
	return null
}

interface NoteViewProps {
	note: Note
}
export const NoteView = ({note}: NoteViewProps) => {
	return (
		<div className="NoteView">
			<h1>{note.name}</h1>
			<div className="NoteContent"></div>
			<div className="NoteSidebar">
				<TodoList todos={note.todos} />
			</div>
		</div>
	)
}

interface TodoListProps {
	todos: Signal<Todo[]>
}
const TodoList = ({todos}: TodoListProps) => {
	return (
		<div>
			{todos.value.map((todo) => {
				return <TodoItem key={todo.id} todo={todo} />
			})}
		</div>
	)
}

interface TodoItemProps {
	todo: Todo
}
const TodoItem = ({todo}: TodoItemProps) => {
	return (
		<div className="Todo">
			<input
				value={todo.text}
				onChange={(e) => {
					todo.text.value = e.currentTarget.value
				}}
			/>
		</div>
	)
}
