# Development Setup

This guide walks through setting up Accord Protocol for local development on macOS, Linux, and Windows (WSL2).

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| **Git** | Any | Version control |
| **Rust** | stable | Soroban contracts |
| **Node.js** | 20 LTS | Frontend |
| **Stellar CLI** | latest | Build, test, and deploy contracts |
| **Docker** | optional | Local Soroban node |

---

## 1. Install Rust

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"

# Add the WASM target required by Soroban
rustup target add wasm32v1-none
```

Verify: `rustc --version`

---

## 2. Install Stellar CLI

```bash
cargo install --locked stellar-cli --features opt
```

Verify: `stellar --version`

---

## 3. Install Node.js

Use [nvm](https://github.com/nvm-sh/nvm) (recommended) or download from [nodejs.org](https://nodejs.org):

```bash
nvm install 20
nvm use 20
```

Verify: `node --version`

---

## 4. Clone and Configure

```bash
git clone https://github.com/thegreatfeez/accord-protocol.git
cd accord-protocol

# Copy environment templates
cp .env.example .env
cp .env.example frontend/.env.local
```

Edit `frontend/.env.local` and fill in `VITE_CONTRACT_ADDRESS` after deploying (see [`docs/DEPLOYMENT.md`](./DEPLOYMENT.md)).

---

## 5. Frontend Setup

```bash
cd frontend
npm ci
npm run dev    # starts at http://localhost:5173
```

Other useful commands:

```bash
npm run build  # type-check + production build
npm run lint   # ESLint
```

---

## 6. Contract Setup

From the **repository root**:

```bash
# Build all contracts in the workspace
stellar contract build

# Run contract tests
stellar contract test
# or equivalently from the contract directory:
cd contracts/accord && cargo test
```

---

## 7. Local Soroban Node (optional)

A `docker-compose.yml` at the repo root starts a standalone Soroban node:

```bash
docker compose up
```

- Soroban RPC: `http://localhost:8000`
- Horizon: `http://localhost:8001`

Update `.env` to point `SOROBAN_RPC_URL` at `http://localhost:8000` when developing locally.

---

## 8. Create a Deployer Identity

The Stellar CLI uses local key aliases (no browser extension needed for deployment):

```bash
stellar keys generate accord-deployer
stellar keys public-key accord-deployer
```

This prints a `G…` public key. Fund it with testnet XLM:

```bash
stellar network use testnet
stellar keys fund accord-deployer --network testnet
```

Or use [Friendbot](https://friendbot.stellar.org/?addr=YOUR_PUBLIC_KEY) directly.

---

## 9. Verify Your Setup

```bash
# From repo root
stellar contract test          # all Rust tests should pass

cd frontend
npm run lint && npm run build  # should exit 0 with no errors
```

If both commands succeed, your environment is ready. See [`docs/DEPLOYMENT.md`](./DEPLOYMENT.md) to deploy to testnet.

---

## Windows (WSL2) Notes

- Run all commands inside a WSL2 terminal (Ubuntu recommended).
- Docker Desktop for Windows with WSL2 integration enabled is required for the local node.
- Node.js and Rust should be installed inside WSL2, not on the Windows host.

---

## Common Issues

| Problem | Fix |
|---------|-----|
| `wasm32v1-none target not found` | Run `rustup target add wasm32v1-none` |
| `stellar: command not found` | Ensure `~/.cargo/bin` is in your `$PATH` |
| `npm ci` fails with peer errors | Ensure you are on Node.js 20+ |
| Friendbot rate-limit | Wait 60s and retry, or use Stellar Lab account tools |
