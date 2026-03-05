# Merizo

**Shared household expense tracking.** Track shared expenses and bills with your household or friends—simple, secure, and free.

---

## Features

- **Groups** — Create groups, invite via code, switch between households
- **Expenses** — Add expenses with custom splits (equal, exact amounts, percentages)
- **Settle up** — View who owes whom and record settlements
- **Activity** — Timeline of expenses and settlements per group
- **Auth** — Email/password signup and login via [Better Auth](https://www.better-auth.com/)

---

## Tech Stack

| Layer        | Choice |
|-------------|--------|
| Framework   | [Next.js 16](https://nextjs.org/) (App Router) |
| UI          | [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/) / [shadcn/ui](https://ui.shadcn.com/) |
| Data        | [Drizzle ORM](https://orm.drizzle.team/) + [PostgreSQL](https://www.postgresql.org/) |
| Auth        | [Better Auth](https://www.better-auth.com/) (Drizzle adapter, organization plugin) |
| State / API | [TanStack Query](https://tanstack.com/query/latest), Server Actions |
| Forms       | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| Animations  | [Framer Motion](https://www.framer.com/motion/) |

---

## Prerequisites

- **Node.js** 18+ (or [Bun](https://bun.sh/) — project uses `bun.lock`)
- **PostgreSQL** 14+

---

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd merizo
bun install
```

### 2. Environment variables

Create a `.env` file in the project root:

```env
# Required: PostgreSQL connection string
DATABASE_URL=postgresql://user:password@localhost:5432/merizo

# Required: Base URL for Better Auth (use your app URL in production)
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```

For local development, `NEXT_PUBLIC_BETTER_AUTH_URL` should match the URL you use to run the app (e.g. `http://localhost:3000`).

### 3. Database

Apply the schema and (optionally) open Drizzle Studio:

```bash
bun run db:push
bun run db:studio   # optional: browse data at https://local.drizzle.studio
```

### 4. Run the app

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up, create a group, and add expenses.

---

## Scripts

| Command        | Description |
|----------------|-------------|
| `bun run dev`  | Start Next.js dev server |
| `bun run build`| Production build |
| `bun run start`| Start production server |
| `bun run lint` | Run ESLint |
| `bun run db:push`    | Push schema to DB (no migration files) |
| `bun run db:generate`| Generate migrations from schema |
| `bun run db:migrate` | Run migrations |
| `bun run db:studio`  | Open Drizzle Studio |

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/           # Login, signup
│   ├── (private)/          # Dashboard, expenses, settle, activity, groups
│   └── api/                # API routes (e.g. auth)
├── config/                 # App config (name, meta)
├── lib/                    # Core infra
│   ├── auth/               # Better Auth server + client
│   ├── db/pg/              # Drizzle client + schemas
│   └── tanstack-query/     # Query options / keys
├── services/               # Server actions & business logic
│   ├── auth/               # Auth-related actions
│   ├── expenses/           # Expense CRUD + splits
│   ├── groups/             # Group CRUD + membership
│   ├── dashboard/          # Dashboard data
│   ├── activity/           # Activity feed
│   └── settle/             # Settlements
├── ui/                     # UI layer
│   ├── base/               # Primitives (Button, Input, Card, etc.)
│   ├── shared/             # Layouts, nav, providers, avatars
│   └── sections/           # Feature-specific sections (dashboard, auth, etc.)
├── hooks/                  # React hooks (e.g. API hooks)
├── types/                  # Shared TypeScript types
├── validation/             # Zod schemas (auth, expenses, groups)
└── utils/                  # Helpers, errors, cache
```

---

## Deployment

- **Database** — Use a managed PostgreSQL instance (e.g. Vercel Postgres, Neon, Supabase, RDS).
- **App** — Build with `bun run build` and run `bun run start`, or deploy to [Vercel](https://vercel.com/) (recommended for Next.js).
- **Env** — Set `DATABASE_URL` and `NEXT_PUBLIC_BETTER_AUTH_URL` to your production URL.

---

## License

Private. All rights reserved.
