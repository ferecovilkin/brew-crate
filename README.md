<div align="center">

# ☕ BrewCrate

**A fully working coffee-roastery storefront — with a deliberately vulnerable web app hiding inside it.**

Browse it like a real shop. Break it like a real target.

![License: MIT](https://img.shields.io/badge/License-MIT-a9521f)
![Node](https://img.shields.io/badge/Node-%E2%89%A518-3f6b43)
![Built with Express](https://img.shields.io/badge/Built%20with-Express%20%C2%B7%20EJS%20%C2%B7%20SQLite-2c1a10)
![Purpose: Security Training](https://img.shields.io/badge/Purpose-Security%20Training-9a3a28)

</div>

<p align="center">
  <img src="docs/screenshots/homepage.jpg" alt="BrewCrate home page" width="49%">
  <img src="docs/screenshots/products.jpg" alt="BrewCrate product catalog" width="49%">
</p>
<p align="center">
  <img src="docs/screenshots/admin.jpg" alt="BrewCrate admin dashboard" width="98%">
</p>

---

## What is this?

**BrewCrate** looks and behaves like a normal e-commerce site for a small coffee
roastery: you can browse single-origin lots and brewing gear, fill a crate,
check out, leave reviews, and run the shop from an admin dashboard.

Under the hood, it's a **security training lab**. It hides a curated set of
realistic flaws from the **OWASP Top 10** and **OWASP API Security Top 10** — so
students, CTF players, and penetration testers can practice finding and
exploiting bugs in a codebase that behaves like a real product, not a checklist
of toy puzzles.

> ⚠️ **This app is intentionally insecure.** It's built to be attacked in a safe,
> isolated environment. Never deploy it or expose it to the internet.

## Table of contents

- [Quick start](#quick-start) · [Demo accounts](#demo-accounts) · [Features](#features) · [Tech stack](#tech-stack)
- [Why BrewCrate](#why-brewcrate) · [Optional AI assistant](#optional-ai-assistant) · [Troubleshooting](#troubleshooting)
- [Need the answers?](#need-the-answers) · [Security notice](#security-notice) · [License](#license)

---

## Quick start

You need **either Node.js or Docker** — not both. Then grab the code:

```bash
git clone https://github.com/ferecovilkin/brew-crate.git
cd brew-crate
```

> No Git? Click the green **Code** button on GitHub → **Download ZIP**, unzip it,
> and open a terminal in the `brew-crate` folder.

### Option A — Node.js

> Requires [Node.js](https://nodejs.org/) 18+ (20 LTS recommended).

```bash
npm install
npm start
```

That's it. The demo database is created automatically on first launch.
Now open **http://127.0.0.1:3000**.

### Option B — Docker

> Requires [Docker](https://docs.docker.com/get-docker/).

```bash
docker compose up --build
```

Then open **http://127.0.0.1:3000**. The database is seeded while the image
builds, so every run starts clean.

<details>
<summary>Prefer plain <code>docker</code> without Compose?</summary>

```bash
docker build -t brewcrate .
docker run --rm -p 127.0.0.1:3000:3000 brewcrate
```

</details>

> 🔁 **Reset the lab** to a clean state any time with `npm run seed`
> (Node), or just rebuild the image (Docker).

By default the server binds to `127.0.0.1` only. Override the host and port with
the `HOST` and `PORT` environment variables.

## Demo accounts

| Role     | Username      | Password         |
| -------- | ------------- | ---------------- |
| Admin    | `roastmaster` | `DarkRoast2026!` |
| Customer | `nora`        | `frenchpress`    |
| Customer | `dmitri`      | `espresso123`    |
| Customer | `lena`        | `coldbrewfan`    |

You can also register your own account from the sign-up page.

---

## Features

- **Storefront** — home page, full catalog, category browsing, and product
  detail pages with customer reviews.
- **Search** — by name, origin, and tasting notes, with category filters and sorting.
- **Cart & checkout** — cookie-backed cart, order placement, and downloadable receipts.
- **Accounts** — registration, login/logout, editable public profiles, and per-user order history.
- **Admin panel** — operations dashboard, product management, bulk catalog import,
  packing-slip templates, and an order/member directory.
- **Shop assistant** — an optional "BrewBot" helper (works offline, or with an LLM API key).
- **JSON & GraphQL endpoints** — a companion API surface for the catalog and accounts.

## Tech stack

| Layer      | Choice                                 |
| ---------- | -------------------------------------- |
| Runtime    | Node.js (>= 18)                        |
| Web server | Express                                |
| Views      | EJS server-rendered templates          |
| Database   | SQLite via `better-sqlite3`            |
| Auth       | JSON Web Tokens in an HTTP-only cookie |
| Styling    | Hand-written CSS (no framework)        |
| API        | REST (JSON) + GraphQL                  |

## Why BrewCrate

Reading about vulnerabilities isn't the same as finding them. Most training apps
either feel like disconnected puzzle boxes or flag their own bugs so plainly the
exercise becomes trivial. BrewCrate takes a different approach:

- 🧩 **Realistic** — flaws live in ordinary-looking code, spread naturally across
  routes and files the way accidental bugs appear in real projects.
- 🔍 **No hand-holding** — nothing in the app or the comments points at the issues.
  You read, probe, and reason like you would against a real target.
- 🔗 **Chainable** — weaknesses connect, rewarding the multi-step thinking a real
  engagement demands.

It's a practical range for learning **web and API security end to end**:
reconnaissance, authentication and session analysis, access-control testing,
injection, server-side request and template abuse, and business-logic attacks.

## Optional AI assistant

BrewBot works out of the box in **offline mode** with canned responses. To enable
live answers, set an OpenAI-compatible API key before starting the server:

```bash
export OPENAI_API_KEY=sk-...          # macOS / Linux / Git Bash
# $env:OPENAI_API_KEY = "sk-..."      # Windows PowerShell
npm start
```

If no key is set, the app still runs fine — it never crashes over a missing key.

## Troubleshooting

| Problem | Fix |
| ------- | --- |
| Port 3000 already in use (`EADDRINUSE`) | Pick another port: `PORT=3001 npm start` (PowerShell: `$env:PORT=3001; npm start`), or `-p 127.0.0.1:3001:3000` for Docker |
| `Cannot find module ...` | Run `npm install` first |
| Empty shop or database errors | Run `npm run seed` to rebuild the demo data |
| `Could not locate the bindings file` / install scripts "blocked" or "not covered by allowScripts" (common on Kali) | Your npm skipped `better-sqlite3`'s native build. Rebuild it: `npm rebuild better-sqlite3` — then `npm start`. If that's also blocked, run via **Docker** instead. |
| `better-sqlite3` build errors | Install build tools (`apt install -y python3 make g++`, or on Windows use Node 20 LTS), or just run via Docker |

---

## Need the answers?

The exploit steps and fixes for every embedded flaw live in
**[`SOLUTIONS.md`](SOLUTIONS.md)** — the answer key for instructors and for when
you're genuinely stuck. Try finding the bugs yourself first; it's a spoiler, not
a starting point.

## Security notice

**BrewCrate is intentionally vulnerable.** Treat it accordingly:

- ✅ Run it **only** on `localhost` or inside an **isolated container / lab VM**.
- 🚫 **Never** expose it to the public internet or an untrusted network.
- 🚫 **Never** load it with real personal data, credentials, or payment details —
  everything here is disposable test data.
- ⚖️ Use it only against systems and accounts you own or are explicitly authorized to test.

## License

Released under the [MIT License](LICENSE).
