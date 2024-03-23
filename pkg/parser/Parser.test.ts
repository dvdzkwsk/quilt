import {expect, test} from "bun:test"
import {parseNoteLiteral} from "./Parser.js"

test("parseNoteLiteral", () => {
	expect(parseNoteLiteral("")).toEqual({
		note: {
			text: "",
			tags: [],
			timestamp: null,
		},
	})

	expect(parseNoteLiteral('"hello"')).toEqual({
		note: {
			text: "hello",
			tags: [],
			timestamp: null,
		},
	})

	expect(parseNoteLiteral('"hello world"')).toEqual({
		note: {
			text: "hello world",
			tags: [],
			timestamp: null,
		},
	})

	expect(parseNoteLiteral('"hello world" +foo +bar')).toEqual({
		note: {
			text: "hello world",
			tags: [{name: "foo"}, {name: "bar"}],
			timestamp: null,
		},
	})
})
