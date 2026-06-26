# Events API

The events API lists MTGO event records from the match/deck database. It is
the lightest endpoint for discovering what data is available before asking for
metagame, archetype, or matchup summaries over the same event window.

```text
GET /events/:format?
```

`format` can be supplied as the path segment or as a query parameter. If both
are present, the path value wins because it is parsed as the route parameter.
If `event_id` is supplied, it selects that event directly. Otherwise, results
are filtered by format and date range. Date filters default to the recent event
window used by the API.

## Filters

```text
/events/modern
/events?format=pioneer&limit=25
/events/modern?min_date=2026-06-01&max_date=2026-06-26
/events?event_id=12345
```

Supported query parameters are `format`, `event_id`, `min_date`, `max_date`, and `limit`.

`min_date` and `max_date` use calendar dates in `YYYY-MM-DD` form. `limit`
controls how many event rows are returned after sorting by newest event first.
Use `event_id` when linking from another endpoint back to the exact source
event.

## Response Shape

Each event includes:

```text
id
name
date
format
kind
rounds
players
```

`kind` is the MTGO event family, such as a League, Preliminary, Challenge,
Showcase, or Qualifier. `rounds` and `players` describe the event metadata as
reported by the source data and may be useful when deciding whether an event is
large enough for aggregate analysis.
