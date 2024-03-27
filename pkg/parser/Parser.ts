export interface TodoLiteral {
	text: string
	tags: TagLiteral[]
}

export interface TagLiteral {
	name: string
}

export interface ParseTodoLiteralResult {
	todo: TodoLiteral
}
export function parseTodoLiteral(input: string): ParseTodoLiteralResult {
	const todo: TodoLiteral = {
		text: "",
		tags: [],
	}

	let cursor = 0

	function parseText(): string {
		cursor++

		let text = ""
		while (cursor < input.length) {
			const char = input[cursor++]
			if (char === '"') {
				return text
			}
			text += char
		}
		throw new Error("unterminated text literal")
	}

	function parseTag(): TagLiteral {
		cursor++

		const tag: TagLiteral = {name: ""}
		while (cursor < input.length) {
			const char = input[cursor++]
			if (char === " ") {
				return tag
			}
			tag.name += char
		}
		return tag
	}

	while (cursor < input.length) {
		switch (input[cursor]) {
			case " ":
				cursor++
				break
			case '"':
				todo.text = parseText()
				break
			case "+":
				const tag = parseTag()
				todo.tags.push(tag)
				break
		}
	}

	return {todo}
}
