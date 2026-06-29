# Decks API

For shared response, pagination, caching, and rate-limit behavior, see [API Overview](index.md).

The decks API returns raw decklists for players in MTGO events. It is intended
for clients that want to run their own archetype classification or metagame
pipeline from the underlying deck data rather than Videre's aggregate views.

```text
GET /decks/:format?
```

`format` can be supplied as the path segment or as a query parameter. If both
are present, the path value wins. The endpoint accepts the same event filters as
`/events`, plus optional `player` and `archetype` filters.

## Filters

```text
/decks/modern
/decks/modern?event_id=12345
/decks/pioneer?min_date=2026-06-01&max_date=2026-06-26
/decks/modern?player=Manatraders&archetype=Murktide
```

Supported query parameters are `format`, `event_id`, `min_date`, `max_date`,
`player`, `archetype`, `limit`, and `offset`.

`player` and `archetype` are case-insensitive contains filters. Use `event_id`
when reconstructing a single tournament. Use `offset` with `limit` to
page through large events.

Responses use the standard list envelope with `meta.limit`, `meta.offset`,
`meta.has_more`, and `meta.next_offset`. For full-event exports, keep requesting
the same route with `offset=meta.next_offset` until `has_more` is false.

## Response Shape

Each deck row includes:

```text
id
event_id
event_name
date
format
event_type
player
deck_name
archetype
archetype_id
mainboard
sideboard
```

`mainboard` and `sideboard` are arrays of `{ id, name, quantity }` card entries
from the original decklist. `deck_name`, `archetype`, and `archetype_id` are the
current classification metadata; consumers that classify independently can
ignore those fields.

Example response:

```json
{
  "object": "list",
  "parameters": {
    "format": "modern",
    "event_id": 12345,
    "limit": 1
  },
  "meta": {
    "row_count": 1,
    "total": null,
    "limit": 1,
    "offset": 0,
    "has_more": true,
    "next_offset": 1
  },
  "data": [
    {
      "id": 67890,
      "event_id": 12345,
      "event_name": "Modern Challenge 64",
      "date": "2026-06-21",
      "format": "modern",
      "player": "ExamplePlayer",
      "deck_name": "Izzet Murktide",
      "archetype": "Izzet Murktide",
      "archetype_id": 42,
      "mainboard": [
        { "id": 605, "name": "Lightning Bolt", "quantity": 4 }
      ],
      "sideboard": []
    }
  ]
}
```
