# BrewCrate

> A small-batch coffee roastery storefront — and a hands-on web security sandbox hiding inside it.

![License: MIT](https://img.shields.io/badge/License-MIT-a9521f)
![Node](https://img.shields.io/badge/Node-%E2%89%A518-3f6b43)
![Built with Express](https://img.shields.io/badge/Built%20with-Express%20%C2%B7%20EJS%20%C2%B7%20SQLite-2c1a10)
![Purpose: Security Training](https://img.shields.io/badge/Purpose-Security%20Training-9a3a28)

BrewCrate is a fully working e-commerce application for a fictional coffee
roastery. You can browse single-origin lots and brewing gear, add them to a
crate, check out, leave reviews, and manage the shop from an admin dashboard.

It is also a deliberately insecure **training target**. Under the hood it
contains a curated set of realistic security flaws spanning the OWASP Top 10 and
the OWASP API Security Top 10, so students, CTF players, and penetration testers
can practice finding and exploiting vulnerabilities against a codebase that
behaves like a real app rather than a checklist of toy bugs.

<p align="center">
  <img src="docs/screenshots/homepage.jpg" alt="BrewCrate home page" width="49%">
  <img src="docs/screenshots/products.jpg" alt="BrewCrate product catalog" width="49%">
</p>
<p align="center">
  <img src="docs/screenshots/admin.jpg" alt="BrewCrate admin dashboard" width="98%">
</p>

---

## Features

- **Storefront** — home page, full catalog, category browsing, and product
  detail pages with customer reviews.
- **Search** — search by name, origin, and tasting notes with category filters
  and sorting.
- **Cart & checkout** — cookie-backed cart, order placement, and downloadable
  receipts.
- **Accounts** — registration, login/logout, editable public profiles, and
  per-user order history.
- **Admin panel** — operations dashboard, product management, bulk catalog
  import, packing-slip templates, and an order/member directory.
- **Shop assistant** — an optional "BrewBot" helper (works offline, or with an
  LLM API key).
- **JSON & GraphQL endpoints** — a companion API surface for the catalog and
  accounts.

## Tech stack

| Layer      | Choice                              |
| ---------- | ----------------------------------- |
| Runtime    | Node.js (>= 18)                     |
| Web server | Express                             |
| Views      | EJS server-rendered templates       |
| Database   | SQLite via `better-sqlite3`         |
| Auth       | JSON Web Tokens in an HTTP-only cookie |
| Styling    | Hand-written CSS (no framework)     |
| API        | REST (JSON) + GraphQL               |

## Why this project

Reading about vulnerabilities is not the same as finding them. Most training
apps either feel like disconnected puzzle boxes or flag their own bugs so
plainly that the exercise becomes trivial. BrewCrate takes a different approach:

- The flaws live in **ordinary-looking code**, spread naturally across different
  routes and files the way accidental bugs appear in real projects.
- Nothing in the running app or the source comments points at where the issues
  are — you have to read, probe, and reason like you would against a real target.
- The weaknesses are **chainable**, rewarding the kind of multi-step thinking a
  real engagement demands.

It is a practical range for learning **web and API security end to end**:
reconnaissance, authentication and session analysis, access-control testing,
injection, server-side request and template abuse, and business-logic attacks.

> This repository intentionally ships with security weaknesses. That is the
> point. Do not reuse any of this code in a real product.

## Getting started

### Prerequisites

| Tool | Needed for | Check with |
| ---- | ---------- | ---------- |
| [Git](https://git-scm.com/downloads) | cloning the repo | `git --version` |
| [Node.js](https://nodejs.org/) 18 or newer (20 LTS recommended) | running locally | `node -v` |
| [Docker](https://docs.docker.com/get-docker/) | running in a container (alternative to Node) | `docker --version` |

You only need Node.js **or** Docker, not both.

### 1. Get the code

```bash
git clone https://github.com/ferecovilkin/brew-crate.git
cd brew-crate
```

No Git? Download the ZIP from the green **Code** button on GitHub, unzip it, and
open a terminal in the extracted `brew-crate` folder.

### 2a. Run locally (Node.js)

```bash
# Install dependencies
npm install

# Build the SQLite database with demo data
npm run seed

# Start the server
npm start
```

Then open **http://127.0.0.1:3000**.

By default the server binds to `127.0.0.1` only. You can override the host/port
with the `HOST` and `PORT` environment variables.

To reset the lab to a clean state at any time, stop the server and run
`npm run seed` again.

> **Windows:** the commands above work unchanged in PowerShell or Git Bash. If
> `npm install` fails building `better-sqlite3`, use Node 20 LTS (it ships a
> prebuilt binary) or use the Docker route below.

### 2b. Run with Docker

```bash
# Build the image
docker build -t brewcrate .

# Run it, bound to localhost only
docker run --rm -p 127.0.0.1:3000:3000 brewcrate
```

Or with Docker Compose (build + run in one step):

```bash
docker compose up --build
```

Then open **http://127.0.0.1:3000**. The database is seeded during the image
build, so each fresh `docker run` starts from a clean state.

### Troubleshooting

| Problem | Fix |
| ------- | --- |
| `EADDRINUSE` / port 3000 already used | Use another port: `PORT=3001 npm start` (PowerShell: `$env:PORT=3001; npm start`) or `-p 127.0.0.1:3001:3000` for Docker |
| `Cannot find module ...` | Run `npm install` first |
| Empty shop / database errors | Run `npm run seed` |
| `better-sqlite3` build errors | Switch to Node 20 LTS, or use Docker |

### Optional: enable the AI assistant

BrewBot works out of the box in offline mode. To enable live answers, set an
OpenAI-compatible API key before starting the server:

```bash
export OPENAI_API_KEY=sk-...   # optional
npm start
```

If no key is set, the assistant simply falls back to canned responses — the app
never crashes because of a missing key.

## Demo accounts

| Role     | Username      | Password        |
| -------- | ------------- | --------------- |
| Admin    | `roastmaster` | `DarkRoast2026!`|
| Customer | `nora`        | `frenchpress`   |
| Customer | `dmitri`      | `espresso123`   |
| Customer | `lena`        | `coldbrewfan`   |

You can also register your own account from the sign-up page.

## Stuck, or grading someone else's work?

The exploit steps and fixes for every embedded flaw live in
[`SOLUTIONS.md`](SOLUTIONS.md) — it's the answer key for instructors and for
when you're genuinely stuck, not a spoiler to read first. Try finding the bugs
on your own before opening it.

## Security notice

**BrewCrate is intentionally vulnerable.** Please treat it accordingly:

- Run it **only** on `localhost` or inside an **isolated container / lab VM**.
- **Never** expose it to the public internet or an untrusted network.
- **Never** load it with real personal data, real credentials, or real payment
  details. Everything here is disposable test data.
- Use it only against systems and accounts you own or are explicitly authorized
  to test.

## License

Released under the [MIT License](LICENSE).
