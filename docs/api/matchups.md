# Matchups API

For shared response, pagination, caching, and rate-limit behavior, see [API Overview](index.md).

The matchups API returns archetype-versus-archetype win rates for a format over
the selected event window. It is intended for matchup matrix views and for
drilling into a single archetype's spread against the rest of the metagame.

```text
GET /matchups/:format?
```

`format` is required and can be supplied as the path segment or as a query
parameter. If both are present, the path value wins. Use `archetype` to return
one archetype's matchup row.

## Filters

```text
/matchups/modern
/matchups/modern?archetype=Izzet%20Murktide
/matchups/pioneer?min_date=2026-06-01&max_date=2026-06-26
/matchups/modern?event_id=12345
```

Supported query parameters are `format`, `archetype`, `event_id`, `min_date`, `max_date`, and `limit`.

Without `archetype`, the endpoint returns the top archetype rows for the
filtered event window. With `archetype`, the response is limited to that row and
its opposing-archetype summaries.

## Response Shape

Each matrix row includes:

```text
id
archetype
matchups
```

`matchups` is an array of opposing-archetype summaries:

```text
id
archetype
match_count
match_winrate
match_ci
game_count
game_winrate
game_ci
```

`match_count` and `game_count` are the sample sizes for the pairing.
`match_winrate` and `game_winrate` are percentages from the perspective of the
row archetype. `match_ci` and `game_ci` are confidence intervals for those
percentages. Mirror matches are excluded from win-rate fields because they do
not distinguish one archetype from another.

Example response:

```json
{
  "parameters": {
    "format": "modern",
    "archetype": "Izzet Murktide"
  },
  "meta": {
    "row_count": 1
  },
  "data": [
    {
      "id": 42,
      "archetype": "Izzet Murktide",
      "matchups": [
        {
          "id": 7,
          "archetype": "Rakdos Midrange",
          "match_count": 14,
          "match_winrate": "57.14%",
          "match_ci": "±25.93%",
          "game_count": 34,
          "game_winrate": "55.88%",
          "game_ci": "±16.71%"
        }
      ]
    }
  ]
}
```
