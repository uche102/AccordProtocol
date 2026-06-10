# Accord Protocol

[![Contract CI](https://github.com/thegreatfeez/accord-protocol/actions/workflows/ci-contract.yml/badge.svg)](https://github.com/thegreatfeez/accord-protocol/actions/workflows/ci-contract.yml)
[![Lint & Format](https://github.com/thegreatfeez/accord-protocol/actions/workflows/ci-lint.yml/badge.svg)](https://github.com/thegreatfeez/accord-protocol/actions/workflows/ci-lint.yml)
[![Frontend CI](https://github.com/thegreatfeez/accord-protocol/actions/workflows/ci-frontend.yml/badge.svg)](https://github.com/thegreatfeez/accord-protocol/actions/workflows/ci-frontend.yml)
![Soroban](https://img.shields.io/badge/Built%20on-Soroban-blue)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

M-of-N multisig governance and treasury management on Stellar Soroban.

Accord lets any group of co-owners manage a shared on-chain treasury with transparent proposal lifecycles, threshold-based approvals, and auditable execution history — all enforced on-chain with zero trusted intermediaries.

## Current Testnet Deployment

- **Contract name:** `accord` (`contracts/accord`)
- **Contract ID:** _(deploy instructions below — replace with your deployed ID)_
- **Network:** Testnet
- **Explorer:** `https://stellar.expert/explorer/testnet`

> After you run `scripts/deploy.sh` you will get a contract ID. Add it to `frontend/.env.local` as `VITE_CONTRACT_ADDRESS=<id>`.

## Architecture

```text
Frontend (React + Vite) → Freighter Wallet → Soroban RPC → accord Contract
        ^                                                        |
        |─────────── event polling + state reads ─────────────|
```

Detailed architecture: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)

## Repository Layout

```text
contracts/accord     Soroban smart contract (Rust)
frontend/            React 18 + TypeScript + Tailwind web app
scripts/             Deployment and utility automation
docs/                Architecture, API, setup, security, deployment docs
.github/workflows/   Contract + frontend CI pipelines
```

## Quick Start (3 Steps)

> **New Contributors:** See [`docs/SETUP.md`](./docs/SETUP.md) for comprehensive setup on macOS, Linux, and Windows (WSL2).

1. **Install dependencies and configure environment**
   ```bash
   cp .env.example .env
   cp .env.example frontend/.env.local
   cd frontend && npm ci
   ```

2. **Run local checks**
   ```bash
   cd ../contracts/accord && cargo test
   cd ../../frontend && npm run lint && npm run build
   ```

3. **Run the frontend**
   ```bash
   npm run dev
   ```

## Contract vs Frontend Commands

| Area | Command |
|---|---|
| Contract format | `cd contracts/accord && cargo fmt --check` |
| Contract lint | `cd contracts/accord && cargo clippy -- -D warnings` |
| Contract test | `cd contracts/accord && cargo test` |
| Contract build (WASM) | `stellar contract build` |
| Contract deploy | `bash scripts/deploy.sh` |
| Frontend lint | `cd frontend && npm run lint` |
| Frontend build | `cd frontend && npm run build` |
| Frontend dev | `cd frontend && npm run dev` |

## How It Works

1. **Initialize** — A group of co-owners deploys the contract and sets an approval threshold (e.g. 2-of-3).
2. **Propose** — Any owner creates a transfer proposal: specify recipient, amount, token, description, and deadline.
3. **Approve** — Owners approve or revoke their approval individually. The proposal status updates in real time.
4. **Execute** — Once the threshold is met, any owner can execute the proposal and the tokens are transferred on-chain.

Proposals have a transparent lifecycle: `Pending → Ready → Executed | Expired`.

## Tech Stack

- **Smart contract:** Rust, `soroban-sdk 25`
- **Frontend:** React 18, TypeScript, Tailwind CSS, Vite
- **Blockchain:** Stellar Soroban (testnet-first workflow)
- **CI/CD:** GitHub Actions

## Live Network Links

- Soroban Testnet RPC: `https://soroban-testnet.stellar.org`
- Friendbot: `https://friendbot.stellar.org/?addr=<PUBLIC_KEY>`
- Explorer (testnet): `https://stellar.expert/explorer/testnet`
- Stellar Lab: `https://lab.stellar.org`

## Documentation

- Setup Guide: [`docs/SETUP.md`](./docs/SETUP.md)
- Architecture: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)
- Contract API: [`docs/CONTRACT_API.md`](./docs/CONTRACT_API.md)
- Security: [`docs/SECURITY.md`](./docs/SECURITY.md)
- Deployment: [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md)
- Contributing: [`docs/CONTRIBUTING.md`](./docs/CONTRIBUTING.md)

## DevOps & Infrastructure

- **CI coverage:** Contract tests (`cargo test`) and frontend lint + build run on every pull request.
- **Docker:** A local Soroban node is supported via `docker compose up` (Soroban RPC on port 8000, Horizon on port 8001).
- **Dependabot:** Weekly dependency updates enabled for Cargo and NPM.

## Roadmap

### Q3 2026 (Near-term)

- [ ] Freighter wallet integration in the frontend ([open issue](https://github.com/thegreatfeez/accord-protocol/issues))
- [ ] Real-time event feed for proposal activity
- [ ] Owner management UI (add/remove owner proposals)

### Q4 2026 (Mid-term)

- [ ] Multi-token treasury support
- [ ] Time-locked execution (enforce delay after threshold is met)
- [ ] Proposal categories and tagging

### Q1 2027 (Long-term)

- [ ] On-chain spending limits per owner
- [ ] Mobile-responsive UI
- [ ] Soroban contract upgrade support

## Contributor Onboarding

Welcome! Start with [`docs/SETUP.md`](./docs/SETUP.md) to configure your environment, then check [`docs/CONTRIBUTING.md`](./docs/CONTRIBUTING.md) for the full contribution workflow including branch naming, PR expectations, and code standards.

Accord is participating in the [Stellar Drips Wave](https://drips.network/wave/stellar) — open issues are tagged for reward-eligible contributions.

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/thegreatfeez"><img src="https://avatars.githubusercontent.com/u/thegreatfeez?v=4?s=100" width="100px;" alt="thegreatfeez"/><br /><sub><b>thegreatfeez</b></sub></a><br /><a href="#code" title="Code">💻</a> <a href="#doc" title="Documentation">📖</a> <a href="#ideas" title="Ideas, Planning, & Feedback">🤔</a></td>
    </tr>
  </tbody>
</table>
<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## Security Notice

This contract is **unaudited**. Do not use on mainnet with significant value until a formal audit is completed. See [`docs/SECURITY.md`](./docs/SECURITY.md) for responsible disclosure guidelines.

## License

MIT — see [LICENSE](./LICENSE)
