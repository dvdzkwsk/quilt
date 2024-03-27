import {Signal, signal} from "@preact/signals"

export interface Entity {
	id: string
	createdAt: Date
	createdBy: string
	modifiedAt: Date
	modifiedBy: string
}

export function createEntity(): Entity {
	const date = new Date()
	return {
		id: uuid(),
		createdAt: date,
		createdBy: "",
		modifiedAt: date,
		modifiedBy: "",
	}
}

export interface Note extends Entity {
	name: Signal<string>
	content: Signal<string>
	tags: Signal<Tag[]>
	todos: Signal<Todo[]>
}

export function createNote(): Note {
	return {
		...createEntity(),
		name: signal(""),
		content: signal(""),
		tags: signal([]),
		todos: signal([]),
	}
}

export interface Tag extends Entity {
	name: string
}

export function createTag(): Tag {
	return {
		...createEntity(),
		name: "",
	}
}

export interface Todo extends Entity {
	text: Signal<string>
	tags: Signal<Tag[]>
	completed: boolean
	completedAt: string | null
	completedBy: string | null
}

export function createTodo(): Todo {
	return {
		...createEntity(),
		text: signal(""),
		tags: signal([]),
		completed: false,
		completedAt: null,
		completedBy: null,
	}
}

export function uuid(): string {
	return `${Date.now()}` // TODO
}
