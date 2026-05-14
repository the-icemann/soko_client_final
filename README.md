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
.
├── public/                        # Static assets, PWA manifest & icons
├── src/
│   ├── api/                       # API clients
│   │   ├── api.ts                 # Base Axios instance & interceptors
│   │   ├── listings.api.ts
│   │   ├── blog.api.ts
│   │   ├── checkout-api.ts
│   │   ├── orders.api.ts
│   │   ├── notification.api.ts
│   │   ├── profile.api.ts
│   │   └── search.api.ts
│   ├── components/
│   │   ├── ui/                    # shadcn/Radix primitives (button, input, card…)
│   │   ├── common/                # Shared layout pieces (nav, product-card, webchat)
│   │   ├── navigation/            # Bottom navigation bar
│   │   ├── auth/                  # Sign-in, sign-up & complete-profile sub-components
│   │   ├── landing-page/
│   │   ├── Home-page/
│   │   ├── market-place/
│   │   ├── product-detail-page/
│   │   ├── sell-page/
│   │   ├── cart/
│   │   ├── message-page/
│   │   ├── profile-page/
│   │   ├── blog-page/
│   │   ├── blog-post-page/
│   │   ├── write-blog-page/
│   │   ├── search-page/
│   │   └── notification-page/
│   ├── routes/
│   │   ├── __root.tsx             # Root layout & providers
│   │   ├── index.tsx              # Landing page (/)
│   │   ├── about.tsx
│   │   ├── auth/
│   │   │   ├── sign-in.tsx
│   │   │   ├── sign-up.tsx
│   │   │   ├── complete-profile.tsx
│   │   │   └── google/callback.tsx
│   │   └── (app)/                 # Authenticated shell
│   │       ├── route.tsx          # Layout guard & bottom nav
│   │       ├── home.tsx
│   │       ├── marketplace.*      # index, $id
│   │       ├── sell.*             # index, success
│   │       ├── cart.tsx
│   │       ├── checkout.*         # index, confirmation
│   │       ├── blog.*             # index, $slug, write
│   │       ├── farmers.$id.tsx
│   │       ├── profile.*          # index, analytics
│   │       ├── messages.tsx
│   │       ├── search.tsx
│   │       └── user.notifications.tsx
│   ├── store/                     # Zustand stores
│   │   ├── auth-store.ts
│   │   ├── cart-store.ts
│   │   ├── marketplace-store.ts
│   │   ├── sell-store.ts
│   │   ├── blog-store.ts          # + blog-post-store, write-blog-store
│   │   ├── search-store.ts
│   │   ├── notification-store.ts
│   │   ├── product-detail-store.ts
│   │   ├── useMessagesStore.ts
│   │   └── useSignUpStore.ts
│   ├── hooks/                     # Custom React hooks (data fetching, UI logic)
│   ├── lib/                       # Shared utilities (cn, formatters…)
│   ├── types/                     # TypeScript interfaces & enums
│   └── constants/                 # Static data, district list, colours
├── vite.config.js
├── tsconfig.json
└── vercel.json
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
