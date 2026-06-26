# Archetypes API

The archetypes API summarizes card usage by archetype for a format over the
selected event window. It answers questions like "what cards do Izzet Murktide
lists normally play?" rather than "how popular is Izzet Murktide?"; use
`/metagame` for popularity and win-rate summaries.

```text
GET /archetypes/:format?
```

`format` is required and can be supplied as the path segment or as a query
parameter. If both are present, the path value wins. Use `archetype` to focus
on one archetype; this also limits the response to one row.

## Filters

```text
/archetypes/modern
/archetypes/modern?archetype=Izzet%20Murktide
/archetypes/pioneer?min_date=2026-06-01&max_date=2026-06-26
/archetypes/modern?event_id=12345
```

Supported query parameters are `format`, `archetype`, `event_id`, `min_date`, `max_date`, and `limit`.

Without `archetype`, rows are sorted by archetype sample size for the filtered
events. With `archetype`, the response is scoped to the best matching archetype
name in the selected format and event window.

## Response Shape

Each archetype row includes:

```text
id
archetype
count
mainboard
sideboard
```

`mainboard` and `sideboard` are arrays of card statistics:

```text
card
count
percentage
total
average
```

`count` on the archetype row is the number of decks in the filtered window.
Inside `mainboard` and `sideboard`, `count` is the number of decks containing
the card, `percentage` is that count divided by archetype decks, `total` is the
total copies seen across those decks, and `average` is the average copies per
archetype deck.
