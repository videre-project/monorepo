# Sets API

The sets API lists MTGO set records imported from the card catalog. It is meant for browsing releases, building set filters, and checking how many cards, tokens, and products are represented for a set.

```text
GET /sets
GET /sets/:code
```

`/sets` returns a paginated list. `/sets/:code` returns one set by MTGO set code.

## Filters

```text
/sets?q=strixhaven
/sets?code=SOS
/sets?name=Modern Horizons
/sets?type=LargeExpansionSet
```

The `q` parameter searches set code and set name. Explicit parameters win when both are supplied.

## Sorting And Pagination

```text
/sets?order=released&dir=desc&limit=25&offset=50
/sets?order=name&dir=asc
```

Supported sort keys are `released`, `name`, `code`, and `type`. The response includes `total`, `has_more`, and `next_offset` metadata.

## Response Shape

Each set includes:

```text
code
name
release_date
age
set_type
card_count
token_count
product_count
```

Set types are MTGO-derived. They are useful for grouping releases, but they are not intended to be a full paper Magic product taxonomy.
