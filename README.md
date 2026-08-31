# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some [oxlint](https://oxc.rs/docs/guide/usage/linter.html) rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Linting

Run the linter with:

```sh
bun run lint
```

Rules live in `.oxlintrc.json`. The `correctness` category is enabled by default; you can turn on stricter
categories (`suspicious`, `pedantic`, `perf`, `style`, `restriction`) or individual rules there:

```jsonc
{
  "categories": {
    "correctness": "error",
    "suspicious": "warn"
  },
  "rules": {
    "no-empty": ["error", { "allowEmptyCatch": true }]
  }
}
```

Extra plugins (`jsx-a11y`, `import`, `promise`, `vitest`, …) are opt-in via the `plugins` array. See the
[oxlint rule list](https://oxc.rs/docs/guide/usage/linter/rules.html) for everything available.

Pass `--fix` to apply auto-fixable issues:

```sh
bunx oxlint --fix
```
