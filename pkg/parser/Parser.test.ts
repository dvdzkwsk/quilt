import {expect, test} from "bun:test"
import {parseNoteLiteral} from "./parser.js"

test("parseNoteLiteral > empty input returns an empty note", () => {
	expect(parseNoteLiteral("")).toEqual({
		text: "",
		tags: [],
	})
})
