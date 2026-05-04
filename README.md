# Quorum Protocol

**A contribution-ready Stellar multisig prototype with a dummy-data frontend and Soroban contract scaffold.**

Quorum is being prepared for the Stellar Drips Wave as an open-source collaboration project.  
Current focus: make the repo easy for contributors to understand and extend, then incrementally implement the full on-chain multisig workflow.

> Built on [Soroban](https://developers.stellar.org/docs/build/smart-contracts/overview) · Powered by [Stellar](https://stellar.org) · Incentivized via [Drips Wave](https://drips.network/wave/stellar)

---

## Project Status (Current Phase)

This repository is intentionally in a **prototype phase**:

- Frontend uses **dummy data** (mock proposals, owners, and stats)
- Contract exists as **starter Soroban scaffold** (`hello-world`)
- Architecture and folders are prepared for open-source contributions
- No production funds or security assumptions should be made yet

This setup lets contributors start shipping UI, contract modules, and tests independently before full integration.

---

## Target Product Vision

Quorum aims to become a Stellar-native multisig governance primitive where:

- A group of signers owns a shared treasury
- Any sensitive action requires `M-of-N` approvals
- Proposals move through a transparent lifecycle: `pending -> ready -> executed/expired`
- DAOs, teams, and protocols can reuse the same secure approval pattern

---

## Architecture (Now vs Next)

### Now (in repo)

- **Frontend (React + TypeScript + Tailwind + Vite)** with modular components and mock state
- **Soroban contract scaffold** in `contracts/hello-world`
- **Rust workspace** configured for multiple contracts

### Next (contributor milestones)

- Implement real multisig contract module(s)
- Replace frontend mock data with Soroban + wallet adapters
- Add integration and end-to-end tests
- Prepare testnet deployment scripts and docs

---

## File Structure

```txt
quorum-protocol/
├── Cargo.toml                         # Rust workspace config
├── contracts/
│   └── hello-world/
│       ├── Cargo.toml                 # Soroban contract package
│       ├── Makefile                   # build/test helpers
│       └── src/
│           ├── lib.rs                 # starter contract entrypoint
│           └── test.rs                # starter contract test
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx                    # app shell + page orchestration
│       ├── index.css
│       ├── main.tsx
│       ├── components/                # reusable UI blocks
│       │   ├── ApprovalBar.tsx
│       │   ├── CreateProposalModal.tsx
│       │   ├── ProposalCard.tsx
│       │   ├── StatCard.tsx
│       │   └── StatusBadge.tsx
│       ├── data/
│       │   └── mockData.ts            # dummy data source (phase-1)
│       ├── pages/
│       │   ├── DashboardPage.tsx
│       │   └── HistoryPage.tsx
│       └── types/
│           └── quorum.ts              # shared frontend domain types
└── README.md
```

---

## Dummy Data Contract for Contributors

Until on-chain integration lands, contributors should treat `frontend/src/data/mockData.ts` as the temporary backend.

If you open a PR:

- Keep UI features wired to mock state
- Avoid introducing hard Stellar network dependencies unless the issue asks for it
- Preserve type safety in `frontend/src/types/quorum.ts`
- Prefer small, focused PRs (component, contract module, docs, tests)

---

## Getting Started

### Prerequisites

```bash
# Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown

# Stellar CLI
cargo install --locked stellar-cli --features opt
```

### Install and Run Frontend (Dummy Data)

```bash
cd frontend
npm install
npm run dev
```

### Build Contract Workspace

```bash
stellar contract build
```

### Run Contract Tests

```bash
stellar contract test
```

---

## Contribution Guide (Drips Wave)

Full contributor workflow, coding standards, and PR expectations are in **[CONTRIBUTING.md](./CONTRIBUTING.md)**.

Quorum is designed for reward-based collaboration via [Stellar Drips Wave](https://drips.network/wave/stellar).

1. Pick an open issue tagged for Wave work
2. Apply/claim in Drips Wave if required by program rules
3. Fork and create a focused branch
4. Open a PR with clear scope and test notes
5. Link the issue in the PR description

### Suggested Issue Tracks

- **Contract Track:** multisig storage, proposal logic, execution guards, owner management
- **Frontend Track:** wallet UX, proposal forms, history filters, state management
- **Infra Track:** testing harness, local scripts, CI checks, docs improvements

---

## Roadmap

- [x] Repository structure aligned for open-source contributions
- [x] Frontend modularized with dummy data source
- [ ] Replace `hello-world` with `multisig` contract module
- [ ] Implement proposal lifecycle on Soroban
- [ ] Integrate wallet + contract calls in frontend
- [ ] Add integration tests (proposal lifecycle + threshold execution)
- [ ] Document testnet deployment flow
- [ ] Security review before mainnet usage

---

## Security Notice

This project is **unaudited** and in active development.  
Do not use on mainnet with significant value until audits and threat modeling are completed.

---

## License

MIT — see [LICENSE](./LICENSE)