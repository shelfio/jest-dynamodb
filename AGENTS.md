# jest-dynamodb

The public npm package `@shelf/jest-dynamodb`: a Jest preset that starts DynamoDB Local before the tests, creates the tables from `jest-dynamodb-config.js`, and stops it or deletes the tables after the tests. `readme.md` is the user documentation.

## Commands

- `pnpm build` builds `lib/`. Run it before the tests: the repository tests itself through `jest-preset.js`, which loads `lib/`.
- `pnpm test` runs the tests in `tests/` against DynamoDB Local; it needs Java. `pnpm exec jest <path>` runs one file, and `pnpm coverage` adds coverage.
- `pnpm lint` runs oxfmt and `eslint --fix`; CI runs `pnpm lint:ci`.
- `pnpm type-check` type-checks the package.
- `pnpm find-deadcode` lists unused files, exports, and dependencies.

## Rules

- `src/index.ts` is the preset: it points Jest to `src/setup.ts`, `src/environment.ts`, and `src/teardown.ts`. `src/types.ts` has the config type that users import. Keep them backward compatible, because other projects use this preset.
- When a config option or the behavior changes, update `readme.md` in the same change.

## Shared Skills

- Use `shelf-git-conventions` for branches, commits, and pull requests. The default branch is `master`.
- Use `unit-tests-101` when you write or review unit tests.
