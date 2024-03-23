export interface NoteLiteral {
	text: string
	tags: TagLiteral[]
	timestamp: string | null
}

export interface TagLiteral {
	name: string
}

export interface ParseResult {
	note: NoteLiteral
}
export function parseNoteLiteral(input: string): ParseResult {
	const note: NoteLiteral = {
		text: "",
		tags: [],
		timestamp: null,
	}

	let cursor = 0

	function parseTimestamp(): string {
		cursor++

		let timestamp = ""
		while (cursor < input.length) {
			const char = input[cursor++]
			if (char === "]") {
				return timestamp
			}
			timestamp += char
		}
		throw new Error("unterminated timestamp literal")
	}

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
			case "[":
				note.timestamp = parseTimestamp()
				break
			case '"':
				note.text = parseText()
				break
			case "+":
				const tag = parseTag()
				note.tags.push(tag)
				break
		}
	}

	return {note}
}
