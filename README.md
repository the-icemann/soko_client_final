# Soko Client

The web frontend for Soko — an agricultural marketplace connecting farmers and buyers in Uganda.

Built with React 19, TanStack Router, TanStack Query, Tailwind CSS v4, and shadcn/ui.

---

## Features

- **Marketplace** — browse, search, and filter produce listings by category, district, and price
- **Farmer profiles** — view individual farmer pages and their listings
- **Cart & checkout** — add items, review order, and pay via PesaPal
- **Sell** — farmers can create and manage produce listings
- **Messages** — in-app buyer–farmer messaging
- **Blog** — community articles and farming guides
- **SokoBot** — AI assistant (Botpress) available to logged-in users for browsing listings, checking orders, and getting recommendations
- **PWA** — installable on mobile with offline support

---

## Tech Stack

| Layer           | Library                              |
| --------------- | ------------------------------------ |
| Framework       | React 19                             |
| Routing         | TanStack Router (file-based)         |
| Data fetching   | TanStack Query                       |
| Styling         | Tailwind CSS v4, shadcn/ui, Radix UI |
| State           | Zustand                              |
| AI chat         | Botpress Webchat                     |
| Build           | Vite 7, vite-plugin-pwa              |
| Package manager | pnpm                                 |

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+

### Install

```bash
pnpm install
```

### Environment

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable                  | Description                                                                                                                  |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `VITE_BOTPRESS_CLIENT_ID` | Botpress Webchat client ID (from Botpress Cloud → your bot → Integrations → Webchat). Leave blank to disable the bot toggle. |

### Run

```bash
pnpm dev        # dev server on http://localhost:3000
pnpm build      # production build
pnpm preview    # preview production build locally
```

---

## Project Structure

```
src/
  components/     # shared UI components
  routes/
    index.tsx           # landing page (/)
    auth/               # sign-in, sign-up, complete-profile
    (app)/              # authenticated app shell
      home.tsx
      marketplace.*     # listing browse + detail
      sell.*            # create listing flow
      cart.tsx
      checkout.*
      messages.tsx
      profile.*
      blog.*
      search.tsx
  store/          # Zustand stores
  hooks/          # custom React hooks
  lib/            # API clients, utilities
```

---

## Code Quality

```bash
pnpm lint           # ESLint check
pnpm lint:fix       # ESLint auto-fix
pnpm format         # Prettier format
pnpm format:check   # Prettier check
```

Pre-commit hooks (Lefthook) run format and lint automatically on staged files.

---

## Related Repos

- [`soko_backend`](https://github.com/ArielWandera/soko.git) — FASTAPI (python) microservices API
- [`SokoBot`](../SokoBot) — Botpress ADK bot powering the in-app AI assistant
- [`soko_ml`](https://github.com/ArielWandera/soko/tree/main/services/soko-ml) — ML gateway for recommendations and price prediction
