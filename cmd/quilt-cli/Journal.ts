import * as fs from "fs"
import * as path from "path"
import {
	addDays,
	endOfDay,
	format,
	isAfter,
	isSameDay,
	startOfDay,
} from "date-fns"
import {Logger} from "@pkg/logger/Logger.js"
import {AppConfig, uuid} from "./Main.js"
import {Note, loadNoteFromFile} from "./Note.js"

const logger = new Logger("Journal")

export async function getJournalEntriesInDateRange(
	config: AppConfig,
	startDate: Date,
	endDate: Date,
): Promise<Note[]> {
	startDate = startOfDay(startDate)
	endDate = endOfDay(endDate)

	if (!isSameDay(startDate, endDate) && isAfter(startDate, endDate)) {
		throw logger.newError(
			"getJournalEntriesInDateRange",
			"end date cannot be before start date",
			{startDate, endDate},
		)
	}

	logger.debug("getJournalEntriesInDateRange", "find notes in date range", {
		startDate,
		endDate,
	})

	const notes: Note[] = []

	let date = startDate
	while (!isAfter(date, endDate)) {
		logger.debug(
			"getJournalEntriesInDateRange",
			"check for note for date",
			{date},
		)
		const note = await getJournalEntryForDate(config, date)
		if (!note) {
			logger.debug("getJournalEntriesInDateRange", "no note for date", {
				date,
			})
		} else {
			notes.push(note)
		}
		date = addDays(date, 1)
	}
	return notes
}

export async function getJournalEntryForDate(
	config: AppConfig,
	date: Date,
): Promise<Note | null> {
	const file = journalFilepathForDate(config, date)
	if (!fs.existsSync(file)) {
		return null
	}
	const note = await loadNoteFromFile(file)
	note.createdAt = date
	return note
}

export async function printJournalEntry(config: AppConfig, date: Date) {
	const journalEntry = await getJournalEntryForDate(config, date)
	console.log(journalEntry)
}

export async function ensureJournalEntryForDate(
	config: AppConfig,
	date: Date,
): Promise<string> {
	const file = journalFilepathForDate(config, date)
	if (!fs.existsSync(file)) {
		const title = format(date, "EEE, MMM d yyyy")
		const content = `---
id: ${uuid("note")}
title: ${title}
date: ${date.toISOString().split("T")[0]}
todo:
    # - this is an example todo
---

`
		await fs.promises.mkdir(path.dirname(file), {recursive: true})
		await fs.promises.writeFile(file, content, "utf8")
	}
	return file
}

function journalFilepathForDate(config: AppConfig, date: Date): string {
	const filename = format(date, "yyyy-MM-dd")
	return path.join(config.notebookDir, ".quilt/journal", `${filename}.md`)
}
