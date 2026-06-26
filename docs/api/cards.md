# Cards API

Videre's card search API adds additional metadata and search functionality on top of MTGO's catalog model. It searches MTGO card catalog entries from the same PostgreSQL database that backs the event API. Tokens can be searched explicitly, while sealed products and other MTGO catalog products are exposed separately through `/products`.

The main card endpoint is:

```text
GET /cards
GET /cards/named
GET /cards/autocomplete
GET /cards/random
GET /cards/:id
```

`/cards` returns a paginated list. `/cards/named` returns one card by exact or fuzzy card name lookup. `/cards/autocomplete` returns matching card-name suggestions. `/cards/random` returns one random card from the same filtered search space as `/cards`. `/cards/:id` returns one searchable card object by MTGO catalog ID, including card faces when the object has multiple faces or subcard data.

## Query Text

The `q` parameter accepts plain text plus a small set of tagged search terms. Untagged words search card names and oracle text.

```text
/cards?q=lightning bolt
/cards?q=set:MM2 name:"Lightning Bolt"
/cards?q=t:artifact -t:creature
```

Quoted values keep spaces together. Explicit query parameters and tagged `q` terms use the same underlying filters; explicit parameters win when both are supplied.

Use `q` for comparison operators such as `mv<=2`, `pow>=4`, `r>=rare`, `c<=U`, and `released>=2024-01-01`. The explicit query parameters are kept to straightforward exact filters and list controls.

## Named Lookup

For clients that want a single card from a name, `/cards/named` accepts exactly one of `exact` or `fuzzy`:

```text
/cards/named?exact=Lightning%20Bolt
/cards/named?fuzzy=lightnng%20bolt
```

`exact` uses exact normalized card-name matching. `fuzzy` uses the same ranked card search as `/cards?q=...` and returns the best result. The response shape matches `/cards/:id`: a wrapper with a one-row `data` array.

For search boxes, `/cards/autocomplete` returns unique card-name strings:

```text
/cards/autocomplete?q=lightn
/cards/autocomplete?q=spirit&include_tokens=true&limit=20
```

Autocomplete searches printed card names and face names. It excludes tokens by default unless `include_tokens=true` is supplied.

## Random Card

`/cards/random` accepts the same filters as `/cards` and returns one randomly selected matching card:

```text
/cards/random
/cards/random?q=t:dragon format:modern
/cards/random?set=SOS&unique=prints
```

The response shape matches `/cards/:id`: a wrapper with a one-row `data` array.

## Common Filters

Name and text:

```text
/cards?name=Lightning
/cards?exact=Lightning Bolt
/cards?text=draw a card
/cards?q=artist:"Christopher Rush"
/cards?q=flavor:"when dragons"
```

Set and rarity:

```text
/cards?set=SOS
/cards?q=set:MM2 rarity:common
/cards?q=r>=rare
/cards?q=year:2021
/cards?q=released>=2024-01-01
```

Rarity comparisons use the normal rarity ladder: `common`, `uncommon`, `rare`, and `mythic`. MTGO-specific values such as `token`, `bonus`, and `promo` still work as exact rarity filters.

Colors and color identity:

```text
/cards?q=c<=U
/cards?q=c:%3EWU
/cards?q=id:%3DRG
```

Color operators follow Scryfall-style set logic:

| Operator | Meaning |
|---|---|
| `=` | Exactly these colors. |
| `<=` | At most these colors. |
| `>=` | At least these colors. |

MTGO colorless values are exposed as `C` in the API response, so a query like `colors<=U` can return cards whose `colors` array is `["C"]`.

Type filters can be combined with commas or repeated tagged terms in `q`:

```text
/cards?type=artifact,!creature
/cards?q=t:adventure
/cards?q=t:instant -t:sorcery
```

Numeric filters support mana value, power, toughness, loyalty, and defense:

```text
/cards?mana_value=1
/cards?q=mv<=1 -t:land
/cards?q=pow>=4 tou<4
```

Mana-cost filters match exact printed costs:

```text
/cards?mana_cost={R}
/cards?q=m:{U}{U}
```

Catalog filters cover MTGO-specific identifiers:

```text
/cards?q=number:150 set:MM2
/cards?q=artid:12345
```

## Formats And Legalities

Format filters use MTGO format codes. A format without an explicit legality means `legal`.

```text
/cards?format=modern
/cards?q=format:pioneer
/cards?q=legal:modern
/cards?q=legality:modern:banned
```

The response includes a `legalities` object keyed by format code.

## Tokens, Products, And Uniqueness

Tokens are cards in the catalog, but normal searches hide them by default. Use `include_tokens=true` when token rows may appear alongside normal cards, or use a token-only filter when the result should contain only tokens.

```text
/cards?q=is:token
/cards?is_token=true
/cards?q=spirit&include_tokens=true
/cards?q=is:promo
/cards?q=is:multiface
/cards?q=is:split
```

Sealed products and other MTGO catalog products are exposed through `/products`, not `/cards`.

The `unique` option controls print collapsing:

```text
/cards?q=Lightning Bolt&unique=cards
/cards?q=Lightning Bolt&unique=prints
```

`cards` returns one representative per oracle card. `prints` returns each MTGO printing.

MTGO foil clones are preserved in the database as catalog variants rather than independent card rows. They do not appear as separate `/cards` results, and ordinary foil clone catalog IDs do not imply separate CDN images.

## Route Tests

The database-level card tests run with the normal `videre-api` test suite. To also exercise the HTTP route and `q` parser against a running local Worker, start the API and pass its base URL:

```sh
VIDERE_API_BASE_URL=http://localhost:8787 pnpm --filter videre-api test
```

## Response Shape

Card results include the functional MTGO catalog fields used for deckbuilding and search:

```text
id
oracle_id
set_code
set_name
set_release_date
set_type
collector_number
name
artist
art_id
mana_cost
mana_value
type_line
oracle_text
flavor_text
colors
color_identity
power
toughness
loyalty
defense
rarity
frame_style
promo_label
is_token
is_promo
is_multiface
is_split
legalities
image_url
```

`/cards/:id` also includes ordered `faces` for split, modal, adventure, and other multi-face catalog entries.

## Sorting And Pagination

```text
/cards?q=dragon&order=name&dir=asc&limit=25&offset=50
/cards?q=dragon&order=name&include_total=true
```

Supported sort keys are `rank`, `name`, `mana_value`, `set`, and `released`. Card search fetches one extra row by default, so `has_more` and `next_offset` are available without running a second exact-count query. `total` is `null` unless `include_total=true` is supplied; use that when a UI needs an exact result count rather than just pagination.
