# Contributing to Quorum Protocol

Thank you for your interest in improving Quorum. This document is the **authoritative contributor guide** for this repository: how to set up your environment, how we expect changes to be proposed and reviewed, and how to work effectively with the project’s current **prototype** phase (dummy frontend data plus Soroban contract scaffold).

Please read the [README](./README.md) first for product context, architecture, and security expectations.

---

## Table of contents

1. [Code of conduct and collaboration](#code-of-conduct-and-collaboration)
2. [Ways you can contribute](#ways-you-can-contribute)
3. [Development setup](#development-setup)
4. [Repository layout and boundaries](#repository-layout-and-boundaries)
5. [Finding work and program participation](#finding-work-and-program-participation)
6. [Contribution workflow](#contribution-workflow)
7. [Branching, commits, and pull requests](#branching-commits-and-pull-requests)
8. [Coding standards](#coding-standards)
9. [Testing and quality gates](#testing-and-quality-gates)
10. [Documentation](#documentation)
11. [Security and responsible disclosure](#security-and-responsible-disclosure)
12. [Licensing](#licensing)
13. [Questions and maintainer contact](#questions-and-maintainer-contact)

---

## Code of conduct and collaboration

- **Be respectful and constructive.** Review comments should focus on the change, not the person.
- **Assume good intent** and prefer clear questions over assumptions.
- **Keep discussions on-topic** in issues and pull requests (PRs).
- If the project adopts a formal Code of Conduct later, it will supersede this section; until then, these expectations apply to all spaces where the project is discussed (issues, PRs, chats linked from the repo).

Harassment, discrimination, or abusive behavior are not acceptable. Maintainers may remove disruptive content and, when necessary, block participation to protect contributors.

---

## Ways you can contribute

You do not have to write production Soroban code on day one. Useful contributions include:

| Area | Examples |
|------|----------|
| **Frontend** | UI/UX improvements, accessibility, state handling, new pages or components wired to mock data |
| **Contracts** | Storage design, proposal lifecycle, tests, gas-friendly patterns, error handling |
| **Quality** | Tests, lint fixes, CI suggestions, reproducible bug reports |
| **Documentation** | README clarifications, diagrams, deployment notes, contributor onboarding |
| **Reviews** | Thoughtful PR reviews that catch edge cases, naming issues, or missing tests |

Small, focused PRs are easier to review and merge than large refactors bundled with unrelated changes.

---

## Development setup

### Required tools (summary)

| Tool | Purpose |
|------|---------|
| **Git** | Version control |
| **Node.js** (LTS recommended) | Frontend (`frontend/`) |
| **Rust** + `wasm32-unknown-unknown` | Soroban contracts |
| **Stellar CLI** (`stellar`) | Build and test contracts from the repo root |

### Rust and Soroban

```bash
# Install Rust (if needed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# WASM target for Soroban
rustup target add wasm32-unknown-unknown
```

Install the Stellar CLI as described in the [README](./README.md) (or the [official Stellar docs](https://developers.stellar.org/docs/build/smart-contracts/getting-started/setup)).

From the **repository root**:

```bash
stellar contract build
stellar contract test
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Other useful commands:

```bash
npm run build   # Typecheck + production build
npm run lint    # ESLint
```

---

## Repository layout and boundaries

Understanding where code belongs reduces review churn and merge conflicts.

### Frontend (`frontend/`)

- **`src/types/quorum.ts`** — Shared domain types (proposals, owners, stats). Extend these deliberately when the data model grows.
- **`src/data/mockData.ts`** — **Temporary data layer** until Soroban + wallet integration. New UI features should read/write through app state that is ultimately fed from here (or from a future API layer), not scattered magic constants.
- **`src/components/`** — Reusable presentational and small interactive pieces.
- **`src/pages/`** — Route-level or tab-level composition (dashboard, history, etc.).
- **`src/App.tsx`** — Shell: navigation, top-level state, and page switching. Avoid turning it into a dumping ground for feature logic.

**Prototype rule:** Unless an issue explicitly asks for Stellar network integration, avoid adding wallet/SDK dependencies that couple the UI to testnet/mainnet prematurely. Prefer mock-driven flows and clear seams (types + data module) so integration can land in one place later.

### Contracts (`contracts/`)

- The workspace is defined by the root **`Cargo.toml`** (`members = ["contracts/*"]`).
- Today the scaffold lives under **`contracts/hello-world/`**. Future multisig work may add **`contracts/multisig/`** (or similar); follow existing patterns in `Cargo.toml` and sibling crates when adding packages.

### Do not commit

- **`frontend/node_modules/`** and **`frontend/dist/`** — ignored via `frontend/.gitignore`
- **Rust `target/`** — ignored from the repo root
- Local Stellar/Soroban artifacts (see root `.gitignore`)

---

## Finding work and program participation

### GitHub issues

- Use **open issues** as the primary source of scoped work.
- Prefer issues that have a **clear acceptance criteria** (what “done” means, which files or behaviors are in scope).

### Stellar Drips Wave

Quorum is positioned for participation in **[Stellar Drips Wave](https://drips.network/wave/stellar)**. Program rules can change by season; always follow the **current** official instructions for applying, claiming, or earning rewards.

**General expectations:**

1. **Do not start large work** on an issue that is already assigned or actively being addressed by someone else, unless maintainers invite collaboration.
2. **Comment on the issue** if you plan to pick it up, so effort is not duplicated.
3. If the program requires **application or assignment before coding**, wait for that confirmation.

If an issue is labeled for Wave eligibility, treat the label as informational only until you confirm the latest program rules on the Drips site.

---

## Contribution workflow

1. **Fork** the repository (or gain push access to a contributor fork, if your team uses that model).
2. **Create a branch** from `main` (or the branch the maintainers designate as default).
3. **Implement the smallest change** that satisfies the issue, with tests where applicable.
4. **Run local checks** (see [Testing and quality gates](#testing-and-quality-gates)).
5. **Open a pull request** into the default branch with a clear title and description.
6. **Respond to review feedback** in a timely way; it is normal to go through several review rounds.

If you discover that an issue is **wrongly scoped** or **blocked**, comment on the issue early rather than investing days of work in the wrong direction.

---

## Branching, commits, and pull requests

### Branch naming

Use short, descriptive prefixes when possible:

| Prefix | Example |
|--------|---------|
| `feat/` | `feat/history-filters` |
| `fix/` | `fix/proposal-card-a11y` |
| `docs/` | `docs/contributing-setup` |
| `chore/` | `chore/eslint-config` |
| `contract/` | `contract/proposal-storage` |

Maintainership may standardize naming further; follow any updated guidance in issues or pinned discussions.

### Commit messages

- Use the **imperative mood** in the subject line (`Add`, `Fix`, not `Added`, `Fixed`).
- Keep the **first line around 72 characters** or less when practical.
- Optionally add a blank line and a body explaining **why** the change was needed, especially for contracts and security-sensitive behavior.

### Pull request description

A strong PR description helps reviewers and future readers. Include:

1. **What** changed (high level).
2. **Why** it was needed (link the issue: `Fixes #123` or `Refs #123`).
3. **How to verify** (commands you ran, screenshots for UI).
4. **Risks or follow-ups** (known limitations, TODOs that are intentionally left).

### PR size and scope

- **One PR should address one concern** (one issue, or one tightly related cluster of changes).
- Avoid drive-by refactors in files you are not required to touch.
- If you must refactor to implement a feature, **say so in the PR** and keep the refactor minimal and reviewable.

### Draft PRs

Use **GitHub Draft PRs** when you want early feedback on direction before the change is polished. Clearly mark what is incomplete.

---

## Coding standards

### TypeScript and React (`frontend/`)

- **Strict typing:** avoid `any`. Prefer explicit types and narrow unions.
- **Components:** prefer small, composable components; lift state only as high as needed.
- **Accessibility:** use semantic HTML where possible; label form controls; ensure keyboard operability for interactive elements.
- **Styling:** follow existing Tailwind usage; avoid one-off inline styles unless there is a strong reason.
- **Imports:** keep imports ordered in a readable way (no need for automated sorting unless the project adds a formatter rule).

### Rust and Soroban (`contracts/`)

- Prefer **clear names** for storage keys, types, and public contract functions.
- Document **non-obvious invariants** (for example, threshold bounds, owner uniqueness) in comments near the code that enforces them.
- Keep **error handling** explicit; use typed errors where the Soroban project pattern supports it.
- Avoid **panics** on user-controlled inputs; return errors that tests can assert.

### General

- Match the **style and patterns** of surrounding code unless an issue mandates a deliberate migration.
- Do not add **secrets**, private keys, or personal configuration to the repository.

---

## Testing and quality gates

Run the relevant checks before requesting review.

### Frontend

```bash
cd frontend
npm run lint
npm run build
```

### Contracts (from repo root)

```bash
stellar contract test
```

If your change touches both areas, run **both** frontend and contract commands and state that in the PR.

### Adding tests

- **Contracts:** add or extend tests alongside behavior changes. Prefer tests that encode **invariants** (for example, cannot execute below threshold).
- **Frontend:** when logic grows beyond trivial UI, consider unit tests or component tests if the project introduces a test runner; until then, document manual test steps clearly in the PR.

---

## Documentation

- Update the **README** when you change user-visible setup steps, prerequisites, or high-level architecture.
- Update **this file** when contribution rules or quality gates change.
- For small behavior changes, **PR description** may be enough; for new contributor-facing workflows, prefer durable docs in the repo.

---

## Security and responsible disclosure

Quorum is **not audited** and is under active development. Treat it accordingly.

- **Do not open public issues** for unfixed security vulnerabilities.
- Use **GitHub Security Advisories** (or the contact process maintainers publish) for responsible disclosure.

If you are unsure whether something is a vulnerability, you may open a discussion or issue framed as a **private** security report per GitHub’s security policy, if enabled on the repository.

---

## Licensing

By contributing to this repository, you agree that your contributions will be licensed under the same terms as the project. See [LICENSE](./LICENSE) (MIT).

If your employer owns your contributions, ensure you have **authorization** to contribute before opening a PR.

---

## Questions and maintainer contact

- **General questions** about *how* to contribute: open a GitHub Discussion if enabled, or an issue labeled for questions (if maintainers provide one).
- **Issue-specific questions:** comment on the issue thread.
- **PR feedback:** keep responses in the PR review thread so decisions stay searchable.

Thank you again for helping make Quorum a solid, contributor-friendly Stellar project.
