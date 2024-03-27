import {expect, test, describe} from "bun:test"
import {parseTodoLiteral} from "./Parser.js"

describe("parseTodoLiteral", () => {
	test("returns an empty todo when the input is empty", () => {
		expect(parseTodoLiteral("")).toEqual({
			todo: {
				text: "",
				tags: [],
			},
		})
		expect(parseTodoLiteral("            ")).toEqual({
			todo: {
				text: "",
				tags: [],
			},
		})
	})

	test("parses simple text content", () => {
		expect(parseTodoLiteral('"hello"')).toEqual({
			todo: {
				text: "hello",
				tags: [],
			},
		})
	})

	test("allows whitespace inside of text content", () => {
		expect(parseTodoLiteral('"hello world"')).toEqual({
			todo: {
				text: "hello world",
				tags: [],
			},
		})
	})

	test("parses simple tags", () => {
		expect(parseTodoLiteral('"hello world" +foo +bar')).toEqual({
			todo: {
				text: "hello world",
				tags: [{name: "foo"}, {name: "bar"}],
			},
		})
	})
})
