# Videre Monorepo

This repository contains Videre's two active TypeScript services:

| Service | Purpose |
|---|---|
| `services/videre-api` | Cloudflare Worker API for Magic: The Gathering data. |
| `services/videre-bot` | Cloudflare Worker Discord bot and interaction handler. |

The old shared packages and config workspaces have been removed. The repo is now a small pnpm workspace over `services/*`, with shared TypeScript defaults in `tsconfig.base.json`.

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

The root `dev` and `deploy` scripts run the matching script across every workspace.

## License

[Apache-2.0 License](/LICENSE).
