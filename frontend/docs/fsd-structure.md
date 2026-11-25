# FSD Structure

This frontend uses [Feature-Sliced Design](https://feature-sliced.design/) with `src/` layers.

## Layers

| Layer | Purpose | Can import from |
|---|---|---|
| `app` | App entry, providers, router, global styles. Composition root only. | `pages`, `widgets`, `features`, `entities`, `shared` |
| `pages` | Route-level composition. Wire widgets/features into screens; no business logic. | `widgets`, `features`, `entities`, `shared` |
| `widgets` | Large self-contained UI blocks composed from features/entities. | `features`, `entities`, `shared` |
| `features` | User actions with business value (create, edit, filter, export, save). | `entities`, `shared` |
| `entities` | Business entities: model/types, entity API, entity UI (cards, badges). | `shared` |
| `shared` | Reusable, business-agnostic code: UI kit, HTTP client, lib, config, types. | `shared` |

Import rule: **downward only**. Slices in the same layer must not import each other. Cross-slice reuse goes through a lower layer or a slice public API.

## Slice segments

Each slice creates only needed segments:

- `ui/` - React components
- `model/` - types, state, hooks, business rules
- `api/` - requests/mutations for the slice
- `lib/` - slice-local helpers
- `config/` - slice-local constants/config

Every slice exposes a public API via `index.ts`. Import from `@/layer/slice`, never from deep paths.

## Where things go

| Thing | Location | Why |
|---|---|---|
| University/Course card | `entities/university/ui`, `entities/course/ui` | Entity presentation, reusable across widgets/pages |
| Partner badge | `entities/partner/ui/PartnerBadge.tsx` | Entity display piece |
| Entity types | `entities/*/model/types.ts` | Domain model owned by entity |
| Entity API calls | `entities/*/api/` | Read/fetch entity data |
| Add/Edit university form action | `features/university/add-university`, `edit-university` | User action with business value |
| Filters/search/saved search/export | `features/university/filter-universities`, `save-search`, `export-universities` | User actions; filter UI/state, not entity display |
| Directory stats+tabs+filters+grid block | `widgets/university-directory` | Large composed block used by page |
| Directory header (Export/Add buttons) | `widgets/directory-header` | Reusable page header block |
| Route screen | `pages/universities` | Composes widgets/features; no domain logic |
| Router/providers/global CSS | `app/` | App wiring |
| HTTP client, env, routes | `shared/api`, `shared/config` | Business-agnostic infrastructure |
| Buttons, inputs, tabs, pagination, badge, stat card | `shared/ui` | Generic UI kit |
| Generic hooks/utils/types | `shared/lib`, `shared/types` | Reusable non-domain code |

## Path aliases

Configured in `tsconfig.json` and `vite.config.ts`:

- `@/*` -> `src/*`
- `@/app/*`, `@/pages/*`, `@/widgets/*`, `@/features/*`, `@/entities/*`, `@/shared/*`

Prefer layer aliases for cross-layer imports; deep imports into slice internals are forbidden by convention and should be caught by ESLint boundaries.

## Boundaries lint

`eslint.config.js` uses `eslint-plugin-boundaries` to enforce layer import direction. Run:

```bash
npm run lint
```

ESLint dependencies were added to `package.json`; install them before linting:

```bash
npm install
```
