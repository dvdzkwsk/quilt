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

```sh
# show me todos for today
# should be built on our own primitives,
# e.g. `quilt todos .createdAt>={day_start(today)} .createdAt<={day_end(today)}`
quilt today

# show all unscheduled todos, quick/orphaned notes, etc.
quilt triage

# create a todo
quilt todo "this is a todo"

# create a todo with tags (TODO: syntax)
quilt todo "give Kona a bath" +kona +urgent
quilt todo "give Kona a bath" #kona #urgent

# create a todo that repeats (TODO: syntax)
quilt todo "give Kona a bath" ~2w
quilt todo "give Kona a bath" repeat:2w

# print all todos in literal, single-line format for easy grepping
quilt todo
quilt todo +with-this-tag
```
