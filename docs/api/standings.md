# Standings API

For shared response, pagination, caching, and rate-limit behavior, see [API Overview](index.md).

The standings API returns final event standings and tiebreaker data. It is
useful for clients that want to reconstruct tournament results, compare records,
or join standings back to raw decklists.

```text
GET /standings/:format?
```

`format` can be supplied as the path segment or as a query parameter. If both
are present, the path value wins. The endpoint accepts the same event filters as
`/events`, plus optional `player` and `archetype` filters.

## Filters

```text
/standings/modern
/standings/modern?event_id=12345
/standings/pioneer?min_date=2026-06-01&max_date=2026-06-26
/standings/modern?player=Manatraders&archetype=Murktide
```

Supported query parameters are `format`, `event_id`, `min_date`, `max_date`,
`player`, `archetype`, `limit`, and `offset`.

`player` and `archetype` are case-insensitive contains filters. Use `event_id`
for the final standings of a single tournament.

Responses use the standard list envelope with `meta.limit`, `meta.offset`,
`meta.has_more`, and `meta.next_offset`. For full-event exports, keep requesting
the same route with `offset=meta.next_offset` until `has_more` is false.

## Response Shape

Each standing row includes:

```text
event_id
event_name
date
format
event_type
rank
player
record
points
omwp
gwp
owp
deck_id
deck_name
archetype
archetype_id
```

`omwp`, `gwp`, and `owp` are numeric percentage tiebreaker values reported by the source data.
Deck and archetype fields are included when the standing row can be joined back
to a decklist for the same event/player.

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
      "event_id": 12345,
      "rank": 1,
      "player": "ExamplePlayer",
      "record": "7-1",
      "points": 21,
      "omwp": 62.5,
      "gwp": 70,
      "owp": 58.33,
      "deck_id": 67890,
      "archetype": "Izzet Murktide"
    }
  ]
}
```
