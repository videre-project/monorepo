# api-services

This repository contains Videre's API-facing TypeScript services:

| Service | Purpose |
|---|---|
| `services/videre-api` | Cloudflare Worker API for Magic: The Gathering data. |
| `services/videre-bot` | Cloudflare Worker Discord bot and interaction handler. |

The repo is a small pnpm workspace over `services/*`, with shared TypeScript defaults in `tsconfig.base.json`.

## Setup

Use Node.js 18 or newer. pnpm is pinned through Corepack:

```sh
corepack enable
pnpm install
```

## Commands

Run a service locally:

```sh
pnpm --filter videre-api run dev
pnpm --filter videre-bot run dev
```

Deploy a service:

```sh
pnpm --filter videre-api run deploy
pnpm --filter videre-bot run deploy
```

Sync Discord commands for the bot:

```sh
pnpm --filter videre-bot run sync
pnpm --filter videre-bot run sync:dev
```

Run the API regression tests:

```sh
pnpm --filter videre-api test
```

The root `dev` and `deploy` scripts run the matching script across every workspace.

## API Docs

- [Cards API](docs/api/cards.md)
- [Sets API](docs/api/sets.md)
- [Products API](docs/api/products.md)
- [Events API](docs/api/events.md)
- [Decks API](docs/api/decks.md)
- [Matches API](docs/api/matches.md)
- [Standings API](docs/api/standings.md)
- [Metagame API](docs/api/metagame.md)
- [Archetypes API](docs/api/archetypes.md)
- [Matchups API](docs/api/matchups.md)
- [MTGO Manifest API](docs/api/mtgo.md)

## License

[Apache-2.0 License](/LICENSE).
