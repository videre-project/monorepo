# Products API

The products API exposes non-card MTGO catalog entries such as tickets, boosters, complete sets, preconstructed products, trophies, and other tradable catalog objects. Tokens are represented by `/cards`, not `/products`.

```text
GET /products
GET /products/:id
```

`/products` returns a paginated list. `/products/:id` returns one product by MTGO catalog ID.

## Filters

```text
/products?q=ticket
/products?id=1
/products?name=Booster
/products?exact=Event Ticket
/products?set=SOS
/products?type=BSTR
/products?is_tradable=true
```

The `q` parameter searches product name and object type. `type` is MTGO's object type code, such as `BSTR` for boosters or `TCKT` for tickets.

## Sorting And Pagination

```text
/products?q=booster&order=name&dir=asc&limit=25
/products?order=set
```

Supported sort keys are `rank`, `name`, `set`, and `type`. The response includes `total`, `has_more`, and `next_offset` metadata.

## Response Shape

Each product includes:

```text
id
set_code
set_name
name
object_type
texture_number
is_tradable
image_url
```

## Images

Product images use a separate CDN path from card images:

```text
https://r2.videreproject.com/products/{id}-300px.png
```
