<div align="center">

# @jalapenolabs/uikit

**Jalapeno Labs' reusable React component library and design system.**

_Written by Alex Navarro, hand-built over years of product work._

[![CI](https://github.com/JalapenoLabs/uikit/actions/workflows/ci.yml/badge.svg)](https://github.com/JalapenoLabs/uikit/actions/workflows/ci.yml)
[![Release](https://github.com/JalapenoLabs/uikit/actions/workflows/release.yml/badge.svg)](https://github.com/JalapenoLabs/uikit/actions/workflows/release.yml)
[![npm](https://img.shields.io/npm/v/@jalapenolabs/uikit?color=5ea100&label=npm)](https://www.npmjs.com/package/@jalapenolabs/uikit)
[![Docs](https://img.shields.io/badge/docs-Storybook-5ea100?logo=storybook&logoColor=white)](https://jalapenolabs.github.io/uikit)
[![License: MIT](https://img.shields.io/badge/license-MIT-5ea100)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-5ea100?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/react-%3E%3D18-5ea100?logo=react&logoColor=white)](https://react.dev)

</div>

---

A thin, tree-shakeable collection of the React UI elements built across the years
at Jalapeno Labs, packaged once and shared everywhere. React is a peer dependency
and is never bundled, so adding the kit never ships a second copy of React.

- **Modern build:** ESM + CJS + bundled TypeScript declarations, built with Vite.
- **Documented:** living docs on [GitHub Pages](https://jalapenolabs.github.io/uikit), powered by Storybook (fully static, no backend required).
- **Typed end to end:** strict TypeScript, types shipped in the package.
- **Brand-aligned:** design tokens sourced from the [Jalapeno Labs brand](https://github.com/JalapenoLabs/brand) submodule.

## Install

```bash
yarn add @jalapenolabs/uikit
# react and react-dom are peer dependencies
yarn add react react-dom
```

Available from the public npm registry and from GitHub Packages.

## Usage

```tsx
import { Button, brandColors } from '@jalapenolabs/uikit'

export function Example() {
  return <Button
    variant="primary"
    onClick={() => console.log('Spicy!')}
  >
    <span>Get started</span>
  </Button>
}
```

## Brand palette

Design tokens are exported as `brandColors` and mirror
[`brand/theme.json`](https://github.com/JalapenoLabs/brand) from the brand
submodule, the single source of truth for the design system.

| Token | Hex | Swatch |
| --- | --- | --- |
| `primary` | `#5ea100` | ![primary](https://img.shields.io/badge/_-5ea100?style=flat-square) |
| `secondary` | `#9bcb3c` | ![secondary](https://img.shields.io/badge/_-9bcb3c?style=flat-square) |
| `salmon` | `#ed7470` | ![salmon](https://img.shields.io/badge/_-ed7470?style=flat-square) |
| `sunset` | `#ecbd40` | ![sunset](https://img.shields.io/badge/_-ecbd40?style=flat-square) |
| `sky` | `#7ca7e4` | ![sky](https://img.shields.io/badge/_-7ca7e4?style=flat-square) |
| `ocean` | `#3f5f99` | ![ocean](https://img.shields.io/badge/_-3f5f99?style=flat-square) |
| `dream` | `#45aaf2` | ![dream](https://img.shields.io/badge/_-45aaf2?style=flat-square) |
| `cyan` | `#48cfae` | ![cyan](https://img.shields.io/badge/_-48cfae?style=flat-square) |

## Documentation

Live component docs are published to **[jalapenolabs.github.io/uikit](https://jalapenolabs.github.io/uikit)**.
Storybook builds a static site, so the docs are hosted on GitHub Pages with no
server to run or maintain.

Run the docs locally:

```bash
yarn storybook
```

## Local development

This repo uses Yarn Berry (node-modules linker, no PnP) and includes the private
`brand` submodule.

```bash
git clone --recurse-submodules git@github.com:JalapenoLabs/uikit.git
cd uikit
corepack enable
yarn install
```

Already cloned without submodules? Run `git submodule update --init --recursive`.

| Command | Description |
| --- | --- |
| `yarn storybook` | Run Storybook on `:6006` |
| `yarn build` | Build the publishable `dist/` |
| `yarn build-storybook` | Build the static docs site |
| `yarn typecheck` | Type-check with `tsc --noEmit` |
| `yarn lint` | Lint (zero warnings allowed) |
| `yarn test` | Run the test suite |
| `yarn test:dev` | Run tests in watch mode |

## Contributing

- `develop` is the integration branch; open pull requests against it.
- `main` is stable. Merging into `main` auto-publishes a new patch release and
  redeploys the docs.
- CI runs lint, typecheck, test, and build on every pull request.
- All code carries a `// Copyright © <year> Jalapeno Labs` header and follows the
  conventions in [`CLAUDE.md`](./CLAUDE.md).

## License

[MIT](./LICENSE) © Jalapeno Labs

Written by [Alex Navarro](https://github.com/navarrotech).
