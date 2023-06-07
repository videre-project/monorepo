# `@videre/monorepo`

## ⚡ Quick Links

- [Overview](#overview)
  - [Packages](#packages)
  - [Services](#services)
- [Getting Started](#-getting-started)
  - [Installation](#installation)
  - [Working with Yarn Workspaces](#working-with-yarn-workspaces)
  - [Configuring Projects](#configuring-projects)
  - [Yarn Global Runner](#yarn-global-runner)
- [Contributing](#-contributing)
- [License](#%EF%B8%8F-license)

## Overview

### Packages

<table>
  <tr>
    <td style="vertical-align: middle;">
      <a href="/packages/@videre-core">
        <img align="top" src="https://img.shields.io/badge/@videre/core-%23073551.svg?&style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDUiIGhlaWdodD0iMzkiIHZpZXdCb3g9IjAgMCA0NSAzOSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTI0LjU5NzUgMzEuMjM1MUwyMC40OTUxIDI0LjEwNDhMMzEuNjUgNy4xODc1QzMzLjUyNTIgNC4wMzU5MyAzMC4xNzQ5IDAuMjkzMDkxIDMwLjE3NDkgMC4yOTMwOTFIMzUuNzUyM0gzNi42MDAzQzQwLjIwMjIgMC4yOTMwOTEgNDIuMzU4OSA0LjI5ODQxIDQwLjM3NjEgNy4zMDU0NEwzNS43NTIzIDE0LjMxNzhMMzAuMTc0OSAyMi43NzY0TDI0LjU5NzUgMzEuMjM1MVoiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcl8xNTAxXzcxMykiLz4KPHBhdGggZD0iTTIuNjkzODUgNy4xMzIyNkgxMC43NjIxTDIwLjQ5NTQgMjQuMDQ5NUMyMi4xNjQ0IDI2Ljk1MDUgMjcuMzg2NCAyNi45NTA1IDI3LjM4NjQgMjYuOTUwNUwyNC41OTc3IDMxLjE3OThDMjIuNzMwMSAzNC4yOTI1IDE4LjIwMyAzNC4yNDUzIDE2LjQwMDYgMzEuMDk0NEwyLjY5Mzg1IDcuMTMyMjZaIiBmaWxsPSJ1cmwoI3BhaW50MV9saW5lYXJfMTUwMV83MTMpIi8+CjxwYXRoIGQ9Ik0xMC43NjIgNy4xODc1MUMxMS40OTQ0IDcuMTg3NTEgMTEuMzY1OSA3LjE4NzUxIDEwLjc1ODkgNy4xODc1MUM3LjgwOTk1IDcuMTkwNDQgNS4wNTQxNiAxMS4zMjE0IDUuMDU0MTYgMTEuMzIxNEwyLjY5MzczIDcuMTg3NTFDMi42OTM3MyA3LjE4NzUxIDguOTIwNjIgNy4xODc1MSAxMC43NTg5IDcuMTg3NTFDMTAuNzU5OSA3LjE4NzUxIDEwLjc2MSA3LjE4NzUxIDEwLjc2MiA3LjE4NzUxWiIgZmlsbD0idXJsKCNwYWludDJfbGluZWFyXzE1MDFfNzEzKSIvPgo8cGF0aCBkPSJNMjIuMTcyMyAxLjEzMjc5TDI0LjExMTYgNC41NTUxOEMyNC43NzgzIDUuNzMxNzYgMjMuOTI4NCA3LjE5MDI5IDIyLjU3NjEgNy4xOTAyOUgyLjcwNDk2TDAuMjM2MDc2IDIuODgwMkMtMC40Mzc5MTYgMS43MDM1NyAwLjQxMTU3NSAwLjIzNzk3NiAxLjc2NzU3IDAuMjM3OTc2SDIwLjYzNjdDMjEuMjcyMyAwLjIzNzk3NiAyMS44NTg5IDAuNTc5NzY5IDIyLjE3MjMgMS4xMzI3OVoiIGZpbGw9InVybCgjcGFpbnQzX2xpbmVhcl8xNTAxXzcxMykiLz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl8xNTAxXzcxMyIgeDE9IjM0LjQ2MjkiIHkxPSIyLjg4NTQ2IiB4Mj0iMjIuNzE0OSIgeTI9IjI2LjgyMjciIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzAwQzZGMiIvPgo8c3RvcCBvZmZzZXQ9IjAuNjU4MTI0IiBzdG9wLWNvbG9yPSIjMDA4M0QyIi8+CjxzdG9wIG9mZnNldD0iMC45Njg0OTMiIHN0b3AtY29sb3I9IiMxNDNDODEiLz4KPC9saW5lYXJHcmFkaWVudD4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDFfbGluZWFyXzE1MDFfNzEzIiB4MT0iNi45OTU5NCIgeTE9IjcuMDc3MjciIHgyPSIyMS44MzI2IiB5Mj0iMzUuODEzIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIG9mZnNldD0iMC4wMTA0MTY3IiBzdG9wLWNvbG9yPSIjMDcyMDYwIiBzdG9wLW9wYWNpdHk9IjAuOSIvPgo8c3RvcCBvZmZzZXQ9IjAuMTkyNzA4IiBzdG9wLWNvbG9yPSIjMDA0RTk0Ii8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzAwN0NCMyIvPgo8L2xpbmVhckdyYWRpZW50Pgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50Ml9saW5lYXJfMTUwMV83MTMiIHgxPSIxNi4zMTciIHkxPSItMS4zMDYzNiIgeDI9IjUuNzI3MjUiIHkyPSIxMS43NjU0IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiMwMEM2RjIiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMDA4M0QyIi8+CjwvbGluZWFyR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQzX2xpbmVhcl8xNTAxXzcxMyIgeDE9IjE2LjMxNyIgeTE9Ii0xLjMwNjM2IiB4Mj0iNS43MjcyNSIgeTI9IjExLjc2NTQiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzAwQzZGMiIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMwMDgzRDIiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K" />
      </a>
    </td>
    <td>
      Library for building and interacting with Videre Project services.
    </td>
  </tr>
  <tr>
    <td style="vertical-align: middle;">
      <a href="/packages/@videre-js">
        <img align="top" src="https://img.shields.io/badge/@videre/js-%23F7DF1E.svg?&style=for-the-badge&logo=javascript&logoColor=black" />
      </a>
    </td>
    <td>
      Isomorphic JavaScript utilities optimized for performance and DX.
    </td>
  </tr>
  <tr>
    <td style="vertical-align: middle;">
      <a href="/packages/@videre-magic">
        <img align="top" src="https://img.shields.io/badge/@videre/magic-%23F8F8F5.svg?&style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDYiIGhlaWdodD0iODEiIHZpZXdCb3g9IjAgMCA0NiA4MSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQ1Ljc2MDMgNDAuODczNkMyNi41Njc1IDQ5Ljc4MzkgMjQuNTA3MiA2Ny40NTg2IDIzLjQyMjkgODAuMDM2OUMyMi4zMzg2IDYyLjAzNjkgMTYuMTU3OCA0Ny42MTUyIDAuNzYwMjU0IDQwLjg3MzZDMS43MzQyMSAzMS40ODAxIDIuMTA5ODUgMjUuNzYyMiAzLjI1NDIzIDE2LjgyQzQuOTY5IDI3LjcxODUgNS4xOTQ3MiAzMi42MDkxIDYuOTMwNzcgMzYuNDc3OEM3LjY3MjUxIDM2LjE4NDEgOC40NTcyNiAzNS45MTUzIDkuMjc3NzUgMzUuNjcxM0MxMi4xMTY4IDI2Ljc0MDQgMTEuNzUyNyAxOC44Mjg4IDEzLjMzODYgOC4wMzY5MUMxNC42NjI4IDE4LjI2IDE1LjEyNjUgMjcuNzkzNyAxNi43Mjk1IDM0LjIxNDhDMTcuNjUyIDM0LjExMDkgMTguNTg5IDM0LjAyOTQgMTkuNTM0IDMzLjk3MDNDMjIuNSAyMy44ODEyIDIxLjgwNSAxMy4yNzQgMjMuMjYwMyAwLjAxMjgxNzRDMjQuNzkyMiAxMy4yNzUzIDI0LjM4MTEgMjMuMDUzNiAyNy4xODMgMzMuOTczN0MyOC4xMTMxIDM0LjAzMjYgMjkuMDM0NCAzNC4xMTMgMjkuOTQwNiAzNC4yMTQ4QzMxLjk4MDQgMjQuNzg0MSAzMS43NTYxIDE4LjIyMTQgMzMuMzk4OCA4LjAzNjkxQzM0Ljk0NCAxOC44MjE5IDM1LjA2NTIgMjguMTY5OSAzNy4zNTU0IDM1LjY1MzZDMzguMjAwNCAzNS45MDI3IDM5LjAwNTIgMzYuMTc3NSAzOS43NjE1IDM2LjQ3NzhDNDIuMDYyNiAzMC4zNTE5IDQyLjAyOTggMjQuNDk2OSA0My40ODMxIDE2LjgyQzQ0Ljg0NjUgMjYuNzQwNCA0NC44NzEgMzEuNDgwMSA0NS43NjAzIDQwLjg3MzZaIiBmaWxsPSIjRjE2NzAwIi8+Cjwvc3ZnPgo=" />
      </a>
    </td>
    <td>
      Standard library for Magic: The Gathering with type-safe primitives.
    </td>
  </tr>
  <tr>
    <td style="vertical-align: middle;">
      <a href="/packages/@videre-nodejs">
        <img align="top" src="https://img.shields.io/badge/@videre/nodejs-%23339933.svg?&style=for-the-badge&logo=node.js&logoColor=white" />
      </a>
    </td>
    <td>
      Exposes APIs for testing and building scalable NodeJS applications.
    </td>
  </tr>
  <tr>
    <td style="vertical-align: middle;">
      <a href="/packages/serverless-binary-pack">
        <img align="top" src="https://img.shields.io/badge/serverless--binary--pack-%23000000.svg?&style=for-the-badge&logo=vercel&logoColor=white" />
      </a>
    </td>
    <td>
      Re-packages binaries to partition builds for AWS build-size limits.
    </td>
  </tr>
  <tr>
    <td style="vertical-align: middle;">
      <a href="/packages/serverless-puppeteer">
        <img align="top" src="https://img.shields.io/badge/serverless--puppeteer-%23000000.svg?&style=for-the-badge&logo=vercel&logoColor=white" />
      </a>
    </td>
    <td>
      Optimizes Puppeteer for fast execution on Serverless platforms.
    </td>
  </tr>
</table>

### Services

<table>
  <tr>
    <td style="vertical-align: middle;">
      <a href="/services/@videre-bot">
        <img align="top" src="https://img.shields.io/badge/videre%20bot-%237289DA.svg?&style=for-the-badge&logo=discord&logoColor=white" />
      </a>
    </td>
    <td>
      Discord bot for Magic: The Gathering.
    </td>
  </tr>
  <tr>
    <td style="vertical-align: middle;">
      <a href="/services/@videre-graphql">
        <img align="top" src="https://img.shields.io/badge/videre%20graphql-%23E10098.svg?&style=for-the-badge&logo=graphql&logoColor=white" />
      </a>
    </td>
    <td>
      GraphQL API for first-party and third-party (mirrored) APIs.
    </td>
  </tr>
  <tr>
    <td style="vertical-align: middle;">
      <a href="/services/@videre-graphql">
        <img align="top" src="https://img.shields.io/badge/videre%20ml-%23FF6F00.svg?&style=for-the-badge&logo=tensorflow&logoColor=white" />
      </a>
    </td>
    <td>
      FOSS machine-learning models for Magic: The Gathering.
    </td>
  </tr>
  <tr>
    <td style="vertical-align: middle;">
      <a href="/services/serverless-data-api">
        <img align="top" src="https://img.shields.io/badge/serverless%20data%20api-%23000000.svg?&style=for-the-badge&logo=vercel&logoColor=white" />
      </a>
    </td>
    <td>
      Frontend API for querying source data used by the Videre Project.
    </td>
  </tr>
</table>

## ✨ Getting Started

### Installation

**1. Installing NodeJS**

NodeJS (aka Node) is a cross-platform JavaScript environment built on top of the V8 engine that powers Google Chrome. It is used for testing and running packages and applications developed in this project. NodeJS also comes packaged with the NPM package manager, which is recommended for installing global dependencies.

You can download a NodeJS installer from the [official downloads page](https://nodejs.org/en/download), or [through a package manager](https://nodejs.org/en/download/package-manager).

Verify or check your installed NodeJS version by running the below command:
```sh
node --version
```

> **Note** If a project requires a specific version of NodeJS determined by the V8 version, use:
> ```sh
> $ node
> > process.versions.v8
> '9.4.146.19-node.13'
> ```

**2. Installing Yarn**

This project uses the [Yarn](https://yarnpkg.com) package manager to manage project dependencies and scripts. Yarn version 3.5.0+ is supported, though it's recommended to install Yarn through Corepack as detailed below.

> **Note** If you're using Yarn <2.0, you can upgrade by running `yarn set version berry`.

The recommended way to install or upgrade Yarn is through a NodeJS binary called [Corepack](https://nodejs.org/api/corepack.html). Corepack installs a proxy for Yarn or PNPM binaries that transparently intercepts Yarn or PNPM commands, installs them (if not already installed), and runs the command. This vastly simplifies installation and versioning of package managers across NodeJS projects without the fuss of OS-specific quirks.

To install Yarn through Corepack, run the below command(s) depending on your NodeJS version:

```sh
# For NodeJS v16.9.0+ and v14.19.0+
$ corepack enable

# For NodeJS <16.10
$ npm uninstall -g yarn pnpm
$ npm install -g corepack
```

When completed, verify yarn installs successfully:
```sh
$ yarn --version
3.5.0
```

To install project dependencies, run `yarn` or `yarn install`. For a comprehensive list of Yarn commands, consult the [Yarn docs](https://yarnpkg.com/getting-started/usage).

### Working with Yarn Workspaces

This project uses a [monorepo](https://en.wikipedia.org/wiki/Monorepo) approach to manage dependencies and projects. Monorepos allow for a simplified developer experience, providing better discoverability and atomicity.

With the Yarn workspaces feature, multiple packages and applications can easily coexist and cross-reference each other across different workspaces (aka `packages/` or `services/`). This aids in the efficiency of testability and sharability of configurations, packages and applications without duplicating dependencies or code.

You can list all available workspaces by running:
```sh
$ yarn workspaces list
```

To run a script from a specific workspace, run:
```sh
$ yarn workspace <workspace> run <script>
# or
$ yarn workspace <workspace> <script>
```

> **Note** You can also use `yarn run <script>` or `yarn run <script>` to run a script from your current working directory. This is the recommended way of running scripts if you're working on a specific project.

Additionally, to run scripts by name from all workspaces, use:
```sh
$ yarn workspaces foreach <script>
```

### Configuring projects

In addition to sharing dependencies with yarn workspaces, projects can also share scripts from the `config/` workspace withing adding any dependencies to the project's `project.json` file. This allows for a single source of truth for running scripts across the monorepo.

Shared configs also typically contain base configurations and executables for extending and bootstrapping new projects, establishing sensible defaults or extending the base functionality of tooling. This is useful if nuances in a base configuration can't be separated into individual configuration files, where it'd instead make more sense to control or vendor features programmatically.

Below is a breakdown of all shared configs in this monorepo:

<!-- #region table --->

<table>
  <thead>
    <tr>
      <th>Config</th>
      <th>Docs</th>
      <th>Scripts</th>
      <th>Command</th>
    </tr>
  </thead>
  <tbody>
  <!-- Build Tools -->
    <tr>
      <td style="vertical-align: middle;">
        <a href="/config/tsc">
          <img
            align="top"
            src="https://img.shields.io/badge/config/tsc-%233178C6.svg?&style=for-the-badge&logo=typescript&logoColor=white"
            alt="Typescript logo"
            />
        </a>
      </td>
      <td>
        • <a href="https://www.typescriptlang.org/docs/handbook/compiler-options.html">
          CLI
        </a><br/>
        • <a href="https://www.typescriptlang.org/tsconfig">
          Config
        </a><br/>
      </td>
      <td>
        • <code>watch</code><br/>
        • <code>force</code><br/>
        • <code>clean</code><br/>
        • <code>prepack</code><br/>
      </td>
<td>

```sh
$ yarn tsc <...args?>
$ yarn g:config tsc -d <workspace> <...args?>
```

</td>
    </tr>
    <tr>
  <!-- Testing Tools -->
    <tr>
      <td style="vertical-align: middle;">
        <a href="/config/jest">
          <img
            align="top"
            src="https://img.shields.io/badge/config/jest-%23C21325.svg?&style=for-the-badge&logo=jest&logoColor=white"
            alt="Jest logo"
            />
        </a>
      </td>
      <td>
        • <a href="https://jestjs.io/docs/cli">
          CLI
        </a><br/>
        • <a href="https://jestjs.io/docs/configuration">
          Config
        </a><br/>
      </td>
      <td>
        • <code>watch</code><br/>
        • <code>clean</code><br/>
      </td>
<td>

```sh
$ yarn jest <...args?>
$ yarn g:config jest -d <workspace> <...args?>
```

</td>
    </tr>
  </tbody>
</table>

<!-- #endregion --->

Learn more about running shared scripts with the [Yarn Global Runner](#yarn-global-runner).

### Yarn Global Runner

Run workspace scripts anyhow and from anywhere with the yarn global runner.

This allows you to run pre-defined scripts like `yarn jest clean`. You can run your own commands independently or combine them with pre-defined scripts, e.g. with `yarn tsc watch --target ES5` or `yarn tsc -w --target ES5`.

In yarn configured projects, just run:
```sh
# > videre-project/packages/@videre-nodejs/:
$ yarn jest <...args?>
# or
$ yarn tsc <...args?>
```
Or in any other project directory, run with `g:workspace` or `g:config`:
```sh
# > videre-project/.../:
$ yarn g:workspace @videre/js jest <...args?>
# or
$ yarn g:config jest -d @videre/nodejs <...args?>
```

<!-- #region examples --->

<details><summary>More examples</summary>

> For workspace scripts, run commands with `g:workspace`:
> ```sh
> # > videre-project/.../:
> $ yarn g:workspace <workspace> <...flags?> <script> <...args?>
> # e.g.
> $ yarn g:workspace @videre/js -v jest --watch -- file.test.ts
> $ yarn g:workspace config-jest -d @videre/js -v watch -- file.test.ts
> ```
> 
> For config scripts, run commands with `g:config`:
> ```sh
> # > videre-project/.../:
> $ yarn g:config <workspace> <...flags> <script> <...args?>
> # e.g.
> $ yarn g:config jest -d @videre/js -v watch -- file.test.ts
> ```

</details>

<!-- #endregion --->

Optional flags include:

- `(-d|--default)` Passes a default argument to a script. You can pass multiple arguments with `-d foo bar --`.
- `(-q|--quiet)` Disables yarn runner output (perserves script output).
- `(-v|--verbose)` Enables verbose yarn runner script tracing.

> **Note** The `default` argument for `g:config` scripts must be the current working directory or the name/location of a workspace. This is done to allow for scripts to efficiently read and execute in the expected workspace location.

## 🔥 Contributing
Contributions of any size to this project are always welcome!

Refer to [CONTRIBUTING.md](/docs/CONTRIBUTING.md) for instructions (and tips) on making contributions to this project.

## ⚖️ License
[Apache-2.0 License](/LICENSE).
