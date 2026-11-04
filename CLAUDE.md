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

## Porting status

This library is being assembled by porting self-contained pieces from the legacy
Mooreslab AI codebases (the `frontend-core` ui package, `tesseract/bifrost`
common utilities, and the platform frontend). All ported code is rebranded to
Jalapeno Labs and rewritten to the conventions above.

**Wave 1 (done):**
- Components: Button, FlattenErrors, HighlightFuzzy, AnimatedPercent, CoverageRing
- Hooks: useRepeater, useTimer, useRerender, useSelection, useSubstringSearch,
  usePagination, useScrollOnMount, useScrollPositionRestore, useHotkey,
  useMediaQuery
- Utils: clipText, getErrorMessage, getLast, percent, reorderArray, stringify,
  formatBytes, singleThreadedInterval, setTimeoutToNextSecond, fuzzyMatch, hotkeys,
  csv

**SmartTable (done):** the legacy `mooretable` package, ported whole as
`src/components/SmartTable/`. `SmartTable` (was `TableKit`) is the
batteries-included entry point; `DataTable` is the low-level table. Decisions
made during the port:
- `@tanstack/react-table` joined the runtime dependencies (externalized in the
  build, like @dnd-kit).
- The `@mooreslabaiv1/ui` primitives (Tooltip, Input, Popover, Button, Icon)
  were replaced with local dependency-free equivalents inside the SmartTable
  directory; `@heroui/pagination` was replaced with a native pagination footer.
- i18next was dropped: all user-facing strings live in `SmartTableLabels`
  (English defaults in `labels.ts`), overridable per table via a `labels` prop.
- The sass module + Tailwind classes were rewritten as one scoped stylesheet
  (`jala-table-*` class names) emitted as an inline `<style>` element, themed
  through CSS variables that flip under a `.dark` ancestor or
  `[data-theme='dark']`.
- It reuses the Wave 1 `HighlightFuzzy` component and
  `useScrollPositionRestore` hook rather than shipping private copies.

**SmartTable behavior (follows `~/.claude/docs/ux.md`, Table layout):**
- Theming: every surface carries `jala-table-theme`, including layers portaled
  into `document.body`, so `html .jala-table-theme { --jala-table-*: ... }`
  themes all of them.
- Floating layers (tooltips, menus) render through `FloatingLayer`: a portal
  into `document.body` with fixed positioning from `computeFloatingPosition`,
  because the table's horizontal scroll container clips anything absolutely
  positioned inside it. Layers carry `data-no-row-highlight`, since React
  bubbles portal events to the row.
- Row actions float over the right of the hovered row as icon-only buttons
  with tooltips, at most three; past three, two stay and the ellipsis menu
  (`TableMenu`) holds the rest. On screens that cannot hover (`(hover: none),
  (max-width: 640px)`) every row shows the ellipsis menu in a pinned column
  instead. `rowActionsLayout` (`auto`, `hover`, `menu`) overrides the choice.
  An action whose `onPress` returns a promise shows loading until it settles.
- Every data cell clamps to `cellLineClamp` lines (3 by default; a column's
  `lineClamp` wins, `false` opts out). `cellOverflow: 'expandRow'` (default)
  expands one row at a time on click, the highlighted row where row highlight
  is on. `cellOverflow: 'modal'` is for rows whose click navigates: a
  double-click on a clamped cell opens it in `TableCellDialog`, and a single
  click on one waits `DOUBLE_CLICK_WINDOW_MS` so the double-click can win.
- Clicks on links, buttons, and form fields inside a row are their own, never
  the row's.
- Controls (search, filters, Columns, export) render in one of three places:
  `controls.container` (a portal target such as a page titlebar; the table
  keeps their state, and nothing renders while it is null), the table's own
  toolbar, or, with `toolbar.show: false`, a strip above the table. Hiding the
  toolbar hides the search, results count, and slots, never the Columns
  chooser or export; `columnControls.show: false` removes Columns on purpose.
- The search keeps its own text unless `search.value` is passed, starts narrow
  and widens once it holds text, fills the width on phones, shows a spinner
  for `search.isLoading`, and takes Ctrl+F unless focus is in a text field.
- Filters: one list from two sources, the managed columns' `filter` and
  `filters.definitions` for what is not a column. Kinds are `select`,
  `multiSelect`, `boolean`, and `text`. Values are one record
  (`filters.values` + `onValuesChange`, or kept by the table) so a consumer can
  keep them in the address. Filters narrow `data` before TanStack sees it
  (`applyFilters`), so search, sort, pages, counts, and export all agree. A
  table filter without `matches` is shown but applied by the consumer. The
  icon-only Filters button (with a count badge) opens a full-height drawer
  (`TableDialog` variant `drawer`) that edits a draft until Apply; active
  filters show as tags above the table, removed by one press.
- `csvExport` adds a one-click export (`toCsv` / `downloadCsv` in
  `src/utils/csv.ts`) of the filtered, sorted rows across every page under the
  visible columns. A column exports `exportValue` or its raw accessor value;
  `exportValue: null` leaves it out. Text a spreadsheet would run as a formula
  gets a leading apostrophe.

**Backlog (good next candidates, each adds a dependency or needs decoupling):**
- `MarkdownContent` (react-markdown + remark-gfm + rehype-raw)
- `TaglineRoller` (framer-motion)
- `JSONViewer` (@uiw/react-json-view)
- `FileIcon` (material-icon-theme)
- `DragContext` / `useDraggable` (@dnd-kit)
- `useCsv` (d3-dsv), `useForm` + `useZod` (zod + react-hook-form)
- Utils needing deps or re-typing: `json` (jsonc-parser + zod), `schema` (zod),
  `hashJson` (js-sha256), `deepDiff` (lodash, needs an any-free re-type),
  `time` / `timer` (moment/humanize-duration)
- Decouple-then-port: `TrimLongText`, `Accordion`, `TypeaheadInput` (currently
  bound to @heroui/react); `useSystemTheme` (extract the pure theme resolver)

**Skipped (not portable):** Node-only fs/path utilities (createTree,
searchUpwardsForFile, getUniqueDestinationPath), app-specific `urls.ts`, the
Monaco/Electron/Redux/i18n-coupled components and hooks.

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
