# Runnable

https://github.com/user-attachments/assets/4e363185-6c1f-4582-95c9-315b57700c36

- paste JSX,
- convert it to a tree model,
- preview and edit it visually,
- save and reload versions from Postgres.

## Stack

- Next.js (App Router)
- React + TypeScript
- Zustand (editor state)
- Drizzle ORM + PostgreSQL (Neon)
- Tailwind CSS + shadcn/ui

## How It Works

- Left panel: list saved components, or create a new one from JSX.
- Center panel: iframe preview with click-to-select and inline text edit.
- Right panel: basic style editor (font size, weight, text color, background color).
- Save writes updated `source` + `tree` back to the database.

## API Routes

- `GET /api/component` - list saved components
- `POST /api/component` - create component from source + parsed tree
- `PUT /api/component/:id` - update source/tree
- `GET /api/preview/:id` - fetch one saved component

## Local Setup

1. Install dependencies:

```bash
bun install
```

2. Create `.env`:

```bash
DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require
```

3. Start dev server:

```bash
bun run dev
```

4. Open `http://localhost:3000`.

## Useful Scripts

- `bun run dev` - start development server
- `bun run build` - production build
- `bun run start` - run built app
- `bun run lint` - run ESLint
- `bun run typecheck` - run TypeScript checks

