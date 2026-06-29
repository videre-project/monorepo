# Metagame API

For shared response, pagination, caching, and rate-limit behavior, see [API Overview](index.md).

The metagame API summarizes archetype presence and non-mirror win rates for a
format over the selected event window. It is the endpoint to use for standings-
style metagame tables: share of field, match win rate, and game win rate.

```text
GET /metagame/:format?
```

`format` is required and can be supplied as the path segment or as a query
parameter. If both are present, the path value wins. The endpoint accepts the
same event filters as `/events`.

## Filters

```text
/metagame/modern
/metagame?format=pioneer
/metagame/modern?min_date=2026-06-01&max_date=2026-06-26&limit=25
/metagame/modern?event_id=12345
```

Supported query parameters are `format`, `event_id`, `min_date`, `max_date`, and `limit`.

The response is sorted by archetype presence in the filtered event window.
Use `event_id` for a single-event metagame snapshot or date filters for a
rolling metagame window.

## Response Shape

Each metagame row includes:

```text
id
archetype
count
percentage
match_count
match_winrate
match_ci
game_count
game_winrate
game_ci
```

`count` is the number of decks on the archetype, and `percentage` is that count
as a share of all decks in the filtered event window. `match_count` and
`game_count` are non-mirror sample sizes. `match_ci` and `game_ci` are
confidence intervals for the corresponding win-rate percentages. Win-rate
fields exclude mirror matches because mirrors do not indicate relative
archetype performance.

Example response:

```json
{
  "parameters": {
    "format": "modern",
    "limit": 1
  },
  "meta": {
    "row_count": 1
  },
  "data": [
    {
      "id": 42,
      "archetype": "Izzet Murktide",
      "count": 18,
      "percentage": "12.50%",
      "match_count": 90,
      "match_winrate": "53.33%",
      "match_ci": "±10.31%",
      "game_count": 210,
      "game_winrate": "51.90%",
      "game_ci": "±6.75%"
    }
  ]
}
```
