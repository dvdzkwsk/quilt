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
# create a todo
quilt todo "this is a todo"

# create a todo with tags (TODO: syntax)
quilt todo "give Kona a bath" +kona +urgent
quilt todo "give Kona a bath" #kona #urgent

# create a todo that repeats (TODO: syntax)
quilt todo "give Kona a bath" ~2w
quilt todo "give Kona a bath" repeat:2w

# print all todos in literal, single-line format for easy grepping
quilt todos

# query todos
quilt todos +withThisTag -andNotThisTag

# create a smart list
quilt todos +hasThisTag -andNotThisTag --save-as="My List"

# view a smart list (TODO: syntax)
quilt view "My List"

# show todos for today
# should be built on our own primitives,
# e.g. `quilt select .createdAt>={day_start(today)} .createdAt<={day_end(today)}`
quilt today

# shorthands?
quilt new "give Kona a bath" !!!   # more ! == more urgent?
quilt new "give Kona a bath" ?     # triage
```
