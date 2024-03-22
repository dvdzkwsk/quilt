## Development

```sh
# run the setup script
npm run setup

# build the web app
bun quilt-web        # build to disk for production
bun quilt-web --dev  # start the development server

# build the cli
bun quilt-cli

# run tests
bun test
```

## Brainstorming

-   Store notes in literal format for easy editing?
-   What about editing/deleting notes?
-   Feature to store/isolate notes in subdirectories (i.e. for work)?
-   Write all notes to `notes.txt`. A `Thread` is a materialized view over notes. Some ideas for builtins:
    -   todo
    -   work
    -   urgent (sorted by urgency)
    -   reminders (sorted by nearest)

```sh
# create a new note
quilt new "this is a note"

# create a new note with tags (TODO: syntax)
quilt new "give Kona a bath" +kona +todo +urgent
quilt new "give Kona a bath" #kona #todo #urgent

# create a new note with a reminder
quilt new "give Kona a bath" ~2weeks

# add metadata to a note
quilt new "give Kona a bath" .field:value

# print all notes in literal, single-line format for easy grepping
# possibly with `quilt notes` as an alias
quilt select

# query notes
quilt select "has this text" +hasThisTag -withoutThisTag

# save a query as a thread
quilt select "has this text" --to=@thread

# query notes with a manual SQL query
quilt select --sql "SELECT text FROM notes ORDER BY createdAt"

# print all notes in a thread (TODO: syntax)
quilt select --from=@thread

# show reminders for today
# should be built on our own primitives,
# e.g. `quilt select .createdAt>={day_start(today)} .createdAt<={day_end(today)}`
quilt today

# shorthands?
quilt new "give Kona a bath" !!!   # more ! == more urgent?
quilt new "give Kona a bath" ?     # triage
```
