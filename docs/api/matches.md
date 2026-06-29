# Matches API

For shared response, pagination, caching, and rate-limit behavior, see [API Overview](index.md).

The matches API returns raw round-by-round match records for MTGO events,
including game-level results when the source data includes them. It is the
lowest-level match feed exposed by the public API.

```text
GET /matches/:format?
```

`format` can be supplied as the path segment or as a query parameter. If both
are present, the path value wins. The endpoint accepts the same event filters as
`/events`, plus optional `player` and `archetype` filters.

## Filters

```text
/matches/modern
/matches/modern?event_id=12345
/matches/pioneer?min_date=2026-06-01&max_date=2026-06-26
/matches/modern?player=Manatraders&archetype=Rakdos
```

Supported query parameters are `format`, `event_id`, `min_date`, `max_date`,
`player`, `archetype`, `limit`, and `offset`.

`player` matches either side of the pairing. `archetype` matches either side's
classification. Both are case-insensitive contains filters. Use `offset` with
`limit` to page through large events.

Responses use the standard list envelope with `meta.limit`, `meta.offset`,
`meta.has_more`, and `meta.next_offset`. For full-event exports, keep requesting
the same route with `offset=meta.next_offset` until `has_more` is false.

## Response Shape

Each match row includes:

```text
id
event_id
event_name
date
format
event_type
round
player
opponent
record
result
isbye
games
player_deck_id
player_deck_name
player_archetype
player_archetype_id
opponent_deck_id
opponent_deck_name
opponent_archetype
opponent_archetype_id
```

`result` is from `player`'s perspective. `games` is an ordered array of
per-game results when available. Bye rows can have missing opponent deck fields.

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
      "id": 98765,
      "event_id": 12345,
      "round": 3,
      "player": "ExamplePlayer",
      "opponent": "OpponentPlayer",
      "record": "2-1",
      "result": "Win",
      "isbye": false,
      "games": [],
      "player_archetype": "Izzet Murktide",
      "opponent_archetype": "Rakdos Midrange"
    }
  ]
}
```
