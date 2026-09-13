# am1v

Personal site. A three-slide deck over a WebGL background and a looping video layer.

React 19 · TypeScript · Vite · Tailwind 4 · Bun

## Develop

```bash
bun install && bun run dev
```

| Command | |
| --- | --- |
| `bun run dev` | dev server on :5173 |
| `bun run build` | typecheck + build to `dist/` |
| `bun run preview` | serve the build |
| `bun run lint` | oxlint |

## Layout

```
src/
  components/   UI, composed by Page.tsx
  hooks/        phase, deck, field, video
  field/        WebGL background
  content.ts    copy, links, projects, skills
  app.css       layout + animation
```

## License

View-only, all rights reserved. See [LICENSE](LICENSE).
