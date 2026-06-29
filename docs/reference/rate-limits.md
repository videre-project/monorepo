# Rate Limits

This page documents public request limits and runtime guardrails for
`https://api.videreproject.com`.

For route shapes and response fields, see the endpoint docs under
[`docs/api`](../api/index.md). For card search operators, see
[Card Search Syntax](card-search.md).

The API has two different kinds of protection. Edge rate limits reject requests
before they reach the Worker. Runtime guardrails allow a request to run, but
bound how much work it can ask the Worker and database to do. The distinction
matters for client behavior: an edge rejection should be treated as a signal to
slow down, while a timeout usually means the individual query is too broad or
too expensive.

## Public Edge Limit

The only dedicated public edge rate limit currently applies to collection-aware
card search:

```text
POST /cards/search
20 requests per 10 seconds
```

The counter is keyed by client IP and Cloudflare colo. In normal use, treat this
as roughly 2 requests per second for one client IP, with a short burst allowance.
Cloudflare may count the same IP separately if traffic reaches different colos.

When the limit is exceeded, Cloudflare rejects matching requests before they
reach the Worker. The request does not consume database work, and retrying
immediately is unlikely to help. Clients should back off and retry after the
short mitigation window has passed.

This limit is intentionally scoped to the personalized route rather than every
API route. A single user typing into a search box can otherwise generate a
sequence of uncached POST requests, each with a large body and a different
collection context.

## Why Only `/cards/search`

`POST /cards/search` can include a caller-provided collection of up to 10,000
MTGO catalog IDs. The response depends on the request body, so it is private and
not shared through the public GET cache:

```text
Cache-Control: private, no-store
```

That makes it more expensive than ordinary public GET routes. The endpoint is
intended for applications that personalize search to a user's collection, not
for every keystroke from every anonymous client without client-side throttling.

The route is still designed for interactive use. A collection of a few thousand
cards is expected. The expensive case is repeated broad searches over large
collections, especially when a client sends the full collection for every input
change before the user has paused typing.

For example, this is a reasonable pattern:

- The user stops typing for a short debounce interval.
- The client sends one `POST /cards/search` request.
- The request includes the current collection and a narrow query.
- The UI renders the returned page and waits for the next deliberate input.

This is the pattern to avoid:

- The client sends a POST request for every keypress.
- Each request includes thousands of IDs.
- The query is broad enough to scan a large portion of the catalog.
- Several requests are in flight for the same user at the same time.

## GET Route Guardrails

The other public routes do not currently have a dedicated per-route edge rate
limit. They rely on several lower-level guardrails:

| Guardrail | Value |
|---|---:|
| `Cache-Control` | `max-age=3600, s-maxage=1800` |
| Worker timeout | 15 seconds |
| Database query timeout | 10 seconds |
| Default list limit | 100 |
| Maximum list limit | 500 |
| Autocomplete maximum limit | 100 |

These routes are cacheable by URL. Clients should still avoid tight request
loops and should page with `offset=meta.next_offset` rather than requesting many
large pages in parallel.

The cache makes repeated GET requests cheap only when the URL is identical.
Changing `limit`, `offset`, date filters, sort order, or search text creates a
different cache key. For list views, clients should keep filters stable while
paging and should avoid requesting exact totals unless the UI needs them.

`GET /cards/random` is also a cacheable GET route. The same URL can return the
same random result until the cache expires. Add a meaningful filter if the UI
needs a constrained random card, but avoid adding throwaway cache-busting query
parameters in normal use.

## What Clients Should Do On Errors

The API uses normal HTTP status codes. A rate-limited request is different from
a validation error or an empty result:

- `400 Bad Request`: the request was invalid, or the route returned no rows for
  the supplied filters.
- `429 Too Many Requests`: the client is sending too many matching requests.
  Back off before retrying.
- `5xx` response: the request reached infrastructure or runtime failure. Retry
  with backoff.

Clients should not blindly retry `400` responses. Adjust the query or show the
empty state. For `429` and transient `5xx` responses, retry with backoff and
avoid stacking multiple retries for the same user action.

## Client Recommendations

For collection-backed search, favor fewer and narrower requests:

- Debounce interactive search input.
- Send the smallest collection pool that matches the current feature.
- Prefer `mode=rank` for broad discovery UI.
- Prefer `mode=only` for owned-card inventory views.
- Use narrow search filters when sending large collections.

`mode=rank` is usually the best fit for discovery because it keeps the full
search result available while moving owned cards first. `mode=only` is better
for inventory views where every result must be owned. `mode=exclude` is useful
for "cards I do not have yet" workflows.

For cacheable GET routes, favor stable URLs and sequential paging:

- Reuse URLs when polling.
- Use pagination metadata instead of guessing offsets.
- Request exact totals only when the UI needs them.

If you need sustained higher-volume access, direct SQL through the public
database role or a scheduled export may be a better fit than high-frequency HTTP
requests.
