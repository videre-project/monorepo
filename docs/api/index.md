# API Overview

The Videre API is served from:

```text
https://api.videreproject.com
```

HTTP API routes do not require authentication. The service is optimized for
cacheable public reads over MTGO event, deck, match, card, set, and product
data.

Examples in these docs are representative and may omit nullable fields,
database metadata, or long arrays for readability. Field lists in each endpoint
document are the authoritative shape references.

Reference docs:

- [Card Search Syntax](../reference/card-search.md)
- [Data Sources And Freshness](../reference/data-sources.md)
- [Rate Limits](../reference/rate-limits.md)
- [Responses And Errors](../reference/responses-and-errors.md)

## Choosing An Endpoint

Use the catalog endpoints when you need MTGO objects independent of tournament
results. `/cards` searches card printings and tokens, with the advanced `q`
syntax documented in [Card Search Syntax](../reference/card-search.md). `/sets`
describes MTGO set metadata, and `/products` lists non-card catalog objects
such as boosters, tickets, and sealed products.

Use the event endpoints when you need tournament data. `/events` is the index of
source events. `/decks`, `/matches`, and `/standings` expose the rows behind an
event. `/metagame`, `/archetypes`, and `/matchups` are derived views over the
same event window.

The aggregate routes are meant for summaries, not for reconstructing the source
data. If a client needs every decklist, match row, or final standing, page
through `/decks`, `/matches`, or `/standings` instead.

For provenance and freshness details, see
[Data Sources And Freshness](../reference/data-sources.md).

## Shared Behavior

Successful `GET` responses are cached by the Worker cache with:

```text
Cache-Control: max-age=3600, s-maxage=1800
```

The cache key includes the full URL and an internal cache version. Error
responses are not written to the cache. `POST /cards/search` is intentionally
not cached because its request body can contain a caller-provided collection;
those responses use:

```text
Cache-Control: private, no-store
```

`GET /cards/random` uses the same GET cache path as other public routes. An
identical random-card URL can therefore return the cached random result until
the cache expires or the cache version changes.

Requests have a 15 second Worker timeout. Database queries are cancelled after
10 seconds.

## Pagination

List endpoints accept `limit` and `offset` unless the route documentation says
otherwise.

| Parameter | Default | Maximum | Notes |
|---|---:|---:|---|
| `limit` | 100 | 500 | Controls returned rows. |
| `offset` | 0 | none | Use with `meta.next_offset` for paging. |

Autocomplete uses a smaller limit policy:

| Endpoint | Default | Maximum |
|---|---:|---:|
| `/cards/autocomplete` | 20 | 100 |

Some endpoints calculate exact totals. Others fetch one extra row to determine
whether another page exists. When an exact count is not calculated,
`meta.total` is `null`.

When `meta.has_more` is true, request the same route again with
`offset=meta.next_offset`. Keep the other filters unchanged while paging, since
changing the filter set changes the result order and page boundaries.

## Dates

Event-backed routes use `YYYY-MM-DD` dates for `min_date` and `max_date`.
When the route supports event filters and no date range is supplied, the API
defaults to the recent event window used by the service: from 31 days before
the request date through the request date.

Use `event_id` instead of dates when reproducing a single event. Use date ranges
when building rolling views, such as the last month of Modern Challenges.

For card search, `released` also accepts `YYYY-MM-DD`, and `year` accepts a
four-digit release year.

## Formats

Routes that accept `:format` also accept `format` as a query parameter. If both
are supplied, the path segment wins because it is parsed as the route
parameter.

Format values use Videre's generated MTGO format constants. Common values
include:

- `standard`
- `pioneer`
- `modern`
- `legacy`
- `vintage`
- `pauper`
- `premodern`

## Rate Limits

The public edge rate limit currently applies only to collection-backed card
search. For client guidance and the full guardrail summary, see
[Rate Limits](../reference/rate-limits.md).

- `POST /cards/search`: 20 requests per 10 seconds per client IP and
  Cloudflare colo.

Other HTTP routes rely on cache behavior, pagination limits, Worker timeouts,
database query timeouts, and database pool limits.

## Response Envelopes

This section summarizes the top-level shapes. For client-facing error behavior,
empty-result handling, validation errors, pagination modes, and edge rate-limit
responses, see [Responses And Errors](../reference/responses-and-errors.md).

Paginated list endpoints return:

```json
{
  "object": "list",
  "parameters": {
    "limit": 25
  },
  "meta": {
    "database": "api@worker-db.videreproject.com/mtgo",
    "backend": "postgres",
    "exec_ms": 12.345,
    "row_count": 25,
    "total": null,
    "limit": 25,
    "offset": 0,
    "has_more": true,
    "next_offset": 25
  },
  "data": []
}
```

Detail and aggregate endpoints that use the direct query envelope return:

```json
{
  "parameters": {
    "format": "modern"
  },
  "meta": {
    "database": "api@worker-db.videreproject.com/mtgo",
    "backend": "postgres",
    "exec_ms": 12.345,
    "row_count": 1
  },
  "data": []
}
```

Both envelopes include the original parsed `parameters` so clients can inspect
which filters the API applied. The `database` metadata is diagnostic; clients
should not parse it for routing decisions.

Errors return:

```json
{
  "object": "error",
  "status": 400,
  "reason": "Bad Request",
  "message": "No results found.",
  "body": {
    "parameters": {},
    "meta": {
      "row_count": 0
    },
    "data": []
  }
}
```

`body` is present only when the route has contextual response data to include.
