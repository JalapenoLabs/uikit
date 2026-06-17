> **Source-of-truth policy.** The USER is the primary source of truth. This
> `CLAUDE.md` is the SECOND source of truth. The codebase is **not** a source of
> truth (it can drift). Whenever a design decision is made or changed, update
> this file in the same change. Keep it routinely up to date.
>
> **Style:** No em dashes anywhere in user-facing text (docs, UI, commits, PRs).

# @jalapenolabs/uikit

Jalapeno Labs' reusable React component library and design system. Published to
the public npm registry **and** to GitHub Packages, with documentation hosted on
GitHub Pages via Storybook.

Originally written by Alex Navarro, hand-built across years of product work
before it was consolidated into this package.

## What this package is

A thin, tree-shakeable React component library. React and React DOM are peer
dependencies (`>=18`), never bundled. Every component is style-light and passes
native DOM attributes straight through so consumers keep full control.

## Repository layout

```
.
├── .github/workflows/      CI (ci.yml) and release/publish (release.yml)
├── .storybook/             Storybook config (docs site source)
├── brand/                  Git submodule: JalapenoLabs/brand (design source of truth)
├── src/
│   ├── components/         One directory per component (Component.tsx + .test.tsx + .stories.tsx)
│   ├── hooks/              Reusable React hooks
│   ├── utils/             Framework-agnostic utilities
│   ├── theme/              Design tokens (brand palette, inlined from brand/theme.json)
│   ├── test/               Vitest setup
│   └── index.ts            Public barrel export (the published API surface)
├── tsconfig.json           Editor + typecheck config (noEmit)
├── tsconfig.build.json     Declaration-emit config consumed by vite-plugin-dts
├── vite.config.ts          Library build (ESM + CJS + bundled .d.ts)
├── vitest.config.ts        Test runner config
├── eslint.config.ts        Flat config, extends @jalapenolabs/cli/eslint
└── .release-it.json        Versioning + publish config
```

## Branching and release model

- `main` is **stable**. `develop` is **unstable / integration**.
- Day-to-day work targets `develop` via pull requests. CI (`ci.yml`) runs lint,
  typecheck, test, and build on every PR to `main`/`develop` and on pushes to
  `develop`.
- Releases happen by merging `develop` into `main`. A push to `main` triggers
  `release.yml`, which:
  1. runs release-it to bump the **patch** version, commit, tag, and push
     (commit message carries `[skip ci]`; pushes via `GITHUB_TOKEN` do not
     re-trigger workflows, so there is no release loop),
  2. publishes to the public npm registry,
  3. publishes the same version to GitHub Packages,
  4. builds Storybook and deploys it to GitHub Pages.

Bumping a minor or major version is a manual decision: run release-it locally
with `yarn release-it minor` / `yarn release-it major` from `main`, or adjust
the workflow for that release.

## Tooling decisions (and why)

- **Yarn Berry, node-modules linker (no PnP).** Berry for modern workspace and
  lockfile ergonomics; node-modules linker because PnP still trips up some React
  tooling and Storybook addons. Configured in `.yarnrc.yml`.
- **Vite library mode + vite-plugin-dts.** One tool builds ESM, CJS, and a
  single bundled `dist/index.d.ts`. SWC (`@vitejs/plugin-react-swc`) for fast
  React transforms, matching the wider Jalapeno Labs stack.
- **Storybook does not need a backend.** `storybook build` emits a fully static
  site (`storybook-static/`) that GitHub Pages serves directly. This is why we
  can host living docs for free with zero server.
- **Vitest + happy-dom + Testing Library** for component tests.
- **ESLint** extends `@jalapenolabs/cli/eslint` (same config as the rest of the
  org), with a `license-header/header` rule enforcing the `© <year> Jalapeno
  Labs` header. Default exports are banned except in Storybook CSF and tooling
  configs, where they are required.

## The brand submodule

`brand/` is the private `JalapenoLabs/brand` repo (fonts, theme, logos, brand
guide). It is the design source of truth. Because it is **private** and this
repo is **public**:

- The package does **not** import from `brand/` at build time. Design tokens are
  inlined in `src/theme/tokens.ts` and kept in sync with `brand/theme.json` by
  hand. CI therefore never needs access to the private submodule.
- Clone with submodules for local design work:
  `git clone --recurse-submodules git@github.com:JalapenoLabs/uikit.git`, or
  `git submodule update --init --recursive` in an existing clone.

## Conventions

- Read the applicable `~/.claude/docs/*.md` (typescript, react, unit-tests)
  before editing. Match the existing style: no semicolons, named function
  declarations for components, `type` over `interface`, named exports, grouped
  imports, lookup tables over branchy conditionals, descriptive variable names.
- Every component gets its own directory with a colocated test and story.
- Keep the public API surface in `src/index.ts` explicit (named re-exports).
- This package is public and AI-built code is welcome, but it descends from
  Alex Navarro's original hand-written work. Keep the bar high: portable,
  dependency-light, and genuinely reusable.
- Never commit as a git co-author. Only commit when asked; always push when you
  do.

## Heritage and naming

Many components were ported from earlier Jalapeno Labs codebases that used the
former company name "Mooreslab AI" / "mooreslabai". When porting, every variant
of that name (Moore, Mooreslab, MooresLab, mooreslabai, moores-lab, ...) must be
rewritten to **Jalapeno Labs** (or `jalapenolabs` / `@jalapenolabs` as the
casing demands). Do not leave the old brand anywhere in shipped code, docs, or
identifiers.

## Common commands

```
yarn install            # install deps (Berry)
yarn storybook          # run Storybook locally on :6006
yarn build-storybook    # build the static docs site
yarn build              # build the publishable dist/
yarn typecheck          # tsc --noEmit
yarn lint               # eslint, zero warnings allowed
yarn test               # vitest run
yarn test:dev           # vitest watch mode
```

## Adding a component (checklist)

1. Create `src/components/<Name>/<Name>.tsx` with a `<Name>Props` type and a
   named function (or `forwardRef`) component.
2. Add `src/components/<Name>/<Name>.test.tsx` (behavioral tests).
3. Add `src/components/<Name>/<Name>.stories.tsx` (CSF, `tags: ['autodocs']`).
4. Re-export the component and its public types from `src/index.ts`.
5. Run `yarn lint && yarn typecheck && yarn test && yarn build`.
