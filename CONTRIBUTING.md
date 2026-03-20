# Contributing to Kairos

Thank you for your interest in Kairos. This is a solo project with strong design and architectural opinions, but thoughtful contributions are welcome. Please read this before opening an issue or submitting a pull request.

---

## The Cardinal Rule

Every contribution — code, design, copy, or documentation — should be evaluated against one question:

> **Does this serve someone who is searching, grieving, doubting, or growing — or does it serve metrics?**

Kairos is a companion, not a productivity tool. Features that increase engagement, add gamification, or optimize for retention at the cost of the user's experience are out of scope regardless of how well-implemented they are.

---

## Before You Start

1. **Open an issue first** for any significant change — a new feature, a refactor, a design alteration. This saves you time if the direction doesn't align with the project's philosophy.
2. **Read the architecture docs** — [`ARCHITECTURE.md`](ARCHITECTURE.md) and [`docs/CHALLENGES.md`](docs/CHALLENGES.md) — to understand existing decisions before proposing changes to them.
3. **Check the roadmap** in `README.md` — if something is listed there, there's likely a planned approach.

---

## What's Welcome

- Bug fixes (especially mobile/cross-browser issues)
- Accessibility improvements
- Performance improvements that don't compromise code clarity
- Documentation improvements
- Additional Bible translations (if `bible-api.com` supports them)
- New reading plan content (theological quality standards apply)
- RAG knowledge base expansions (curated, not scraped)

## What's Out of Scope

- Engagement notifications, streaks, or gamification
- Social features (sharing, leaderboards, public profiles)
- Monetisation changes (discuss in an issue first)
- Dependency upgrades without a clear reason
- Style changes that deviate from the design system

---

## Development Setup

```bash
git clone https://github.com/AlexWabita/kairos.git
cd kairos
npm install --legacy-peer-deps
```

Copy `.env.local.example` to `.env.local` and fill in your keys. See `README.md` for the full list.

```bash
npm run dev
```

---

## Code Standards

### Design System — Never Violate

- **Spacing:** `--space-1` through `--space-6`, then `--space-8`, `--space-10`, `--space-16`, `--space-24`. `--space-7` and `--space-9` do not exist.
- **Colors:** use CSS variables (`var(--color-divine)` etc.), never hardcoded hex or `rgba()` values for text and backgrounds
- **Touch targets:** all interactive elements minimum `44px` height
- **Border rule:** never mix `border` shorthand with `borderColor` in event handlers — use `borderWidth`/`borderStyle`/`borderColor` separately

### Component Pattern

All app pages follow the sidebar + mobile nav pattern exactly. See any existing page (`/account`, `/settings`, `/bible`) for the reference implementation.

### Surgical Edits

Make the smallest change that solves the problem. Do not regenerate entire files when a targeted edit will do. Code reviewers should be able to see exactly what changed and why.

### No New Dependencies

Before adding a package, ask: can this be done with what's already here? If a dependency is genuinely necessary, explain why in the PR description.

---

## Commit Messages

```
type: short description in present tense

Types: feat | fix | refactor | docs | style | test | chore
```

Examples:
```
feat: add verse comparison view to Bible reader
fix: action bar hidden behind home indicator on iPhone 14
docs: update ARCHITECTURE with RAG pipeline diagram
```

---

## Pull Request Process

1. Branch from `dev`, not `main`
2. Keep PRs focused — one concern per PR
3. Update `CHANGELOG.md` under `[Unreleased]` with your changes
4. Ensure `npm run build` passes before submitting
5. Describe what you changed, why, and how you tested it

---

## Reporting Bugs

Use the bug report issue template. Include:
- Device and browser
- Steps to reproduce
- What you expected vs what happened
- Screenshot or screen recording if relevant

---

## Code of Conduct

Treat everyone with dignity. This project serves people in vulnerable moments — that ethos extends to how contributors interact with each other.