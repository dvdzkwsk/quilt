export interface NoteLiteral {
	text: string
	tags: TagLiteral[]
}

export interface TagLiteral {
	name: string
}

export function parseNoteLiteral(input: string): NoteLiteral {
	const note: NoteLiteral = {
		text: "",
		tags: [],
	}
	return note
}
