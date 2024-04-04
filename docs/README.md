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
        <img align="top" src="https://img.shields.io/badge/serverless--binary--pack-%23000000.svg?&style=for-the-badge&logo=Amazon+AWS&logoColor=white&color=232F3E" />
      </a>
    </td>
    <td>
      Re-packages binaries to partition builds for AWS build-size limits.
    </td>
  </tr>
  <tr>
    <td style="vertical-align: middle;">
      <a href="/packages/serverless-puppeteer">
        <img align="top" src="https://img.shields.io/badge/serverless--puppeteer-%23000000.svg?&style=for-the-badge&logo=Amazon+AWS&logoColor=white&color=232F3E" />
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
      <a href="/services/@videre-api">
        <img align="top" src="https://img.shields.io/badge/@videre/api-F38020?style=for-the-badge&logo=Cloudflare&logoColor=white" />
      </a>
    </td>
    <td>
      A real-time globally distributed API for Magic: The Gathering.
    </td>
  </tr>
  <tr>
    <td style="vertical-align: middle;">
      <a href="/services/@videre-bot">
        <img align="top" src="https://img.shields.io/badge/@videre/bot-F38020?style=for-the-badge&logo=Cloudflare&logoColor=white" />
      </a>
    </td>
    <td>
      A Discord Bot for Magic: The Gathering cards, deck building, and strategy.
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
