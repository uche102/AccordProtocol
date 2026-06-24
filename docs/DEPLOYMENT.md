# Deployment Guide

This guide covers deploying the Accord contract to Stellar testnet and wiring the frontend to it.

## Prerequisites

- Stellar CLI installed and `accord-deployer` identity created (see [`docs/SETUP.md`](./SETUP.md))
- Funded testnet account: `stellar keys fund accord-deployer --network testnet`

---

## 1. Build the Contract WASM

From the repository root:

```bash
stellar contract build
```

The compiled WASM will be at:
```
target/wasm32v1-none/release/accord.wasm
```

---

## 2. Deploy to Testnet

```bash
bash scripts/deploy.sh
```

The script:
1. Uploads the WASM to the network
2. Deploys a new contract instance
3. Prints the **Contract ID** — save this value

Alternatively, run manually:

```bash
stellar network use testnet

# Upload WASM
stellar contract upload \
  --network testnet \
  --source-account accord-deployer \
  --wasm target/wasm32v1-none/release/accord.wasm

# Deploy contract
stellar contract deploy \
  --network testnet \
  --source-account accord-deployer \
  --wasm target/wasm32v1-none/release/accord.wasm
```

---

## 3. Initialize the Contract

Replace `CONTRACT_ID`, `OWNER_1`, `OWNER_2`, `OWNER_3`, and `THRESHOLD` with your values:

```bash
stellar contract invoke \
  --network testnet \
  --source-account accord-deployer \
  --id CONTRACT_ID \
  -- initialize \
  --owners '["OWNER_1","OWNER_2","OWNER_3"]' \
  --threshold 2
```

**Important:** All owner addresses must sign this transaction (each must authorize). In the CLI, use `--source-account` for each owner or handle via multi-auth in the frontend.

---

## 4. Fund the Contract Treasury

Send tokens to the contract address so it can pay out approved proposals:

```bash
# Example: send 100 XLM (using the native XLM SAC on testnet)
stellar contract invoke \
  --network testnet \
  --source-account accord-deployer \
  --id NATIVE_TOKEN_CONTRACT_ID \
  -- transfer \
  --from accord-deployer \
  --to CONTRACT_ID \
  --amount 1000000000
```

The native XLM SAC contract ID on testnet:
```
CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
```

---

## 5. Wire the Frontend

Add the contract address to `frontend/.env.local`:

```bash
VITE_CONTRACT_ADDRESS=YOUR_CONTRACT_ID
VITE_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
VITE_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
```

Then restart the dev server:

```bash
cd frontend && npm run dev
```

---

## 6. Verify the Deployment

Check the contract on the testnet explorer:

```
https://stellar.expert/explorer/testnet/contract/YOUR_CONTRACT_ID
```

Or use Stellar Lab:

```
https://lab.stellar.org/smart-contracts/contract-explorer?contractId=YOUR_CONTRACT_ID&network=testnet
```

---

## Current Testnet Deployment

| Field | Value |
|-------|-------|
| Contract ID | _(fill in after your first deploy)_ |
| Network | Testnet |
| WASM hash | _(printed by deploy script)_ |
| Deploy tx | _(printed by deploy script)_ |
| Explorer | `https://stellar.expert/explorer/testnet` |

---

## Upgrading the Contract

The contract supports in-place upgrades through a two-step WASM upload and upgrade flow. Only an existing owner may call the `upgrade` function. All on-chain storage (proposals, owners, threshold) is preserved after a successful upgrade.

**Step 1 — Upload the new WASM and obtain the WASM hash:**

```bash
stellar contract upload \
  --network testnet \
  --source-account accord-deployer \
  --wasm target/wasm32v1-none/release/accord.wasm
```

The command prints the WASM hash — save it for the next step.

**Step 2 — Invoke `upgrade` on the live contract:**

```bash
stellar contract invoke \
  --network testnet \
  --source-account accord-deployer \
  --id CONTRACT_ID \
  -- upgrade \
  --caller accord-deployer \
  --new_wasm_hash WASM_HASH
```

Replace `CONTRACT_ID` with the live contract address and `WASM_HASH` with the hash from Step 1. The contract ID and all on-chain storage are preserved after a successful upgrade.

---

## Troubleshooting

**Auth errors (`Error(Contract, #3)` — Unauthorized)**

The caller is not a registered owner, or insufficient XLM was available to cover the Soroban authorization fee. Verify the `--source-account` is one of the contract's owners and that the account holds enough XLM (a few stroops above the base reserve is usually sufficient).

**Fee errors (transaction rejected for insufficient balance)**

The submitting account does not have enough XLM to cover the transaction fee. Fund the account with at least 10 XLM before retrying:

```bash
stellar keys fund accord-deployer --network testnet
```

**RPC timeout errors**

The Soroban RPC node did not respond within the CLI timeout. Check the RPC node health at `https://soroban-testnet.stellar.org/` and retry the command. If the node is healthy, increase the `--timeout` flag (e.g. `--timeout 120`) or switch to a different RPC endpoint.

---

## Post-Deployment Verification Checklist

Run these checks after every deploy or upgrade to confirm the contract is live and healthy:

- [ ] **Contract responds** — call `get_threshold` and confirm it returns the expected integer:
  ```bash
  stellar contract invoke --network testnet --id CONTRACT_ID -- get_threshold
  ```
- [ ] **WASM hash matches** — open the contract page on Stellar Expert and verify the WASM hash matches the one printed during `stellar contract upload`:
  ```
  https://stellar.expert/explorer/testnet/contract/CONTRACT_ID
  ```
- [ ] **Frontend connects** — start the frontend (`npm run dev`), open the app in a browser, and confirm proposals load without errors. If the page shows a connection error, double-check `VITE_CONTRACT_ADDRESS` and `VITE_SOROBAN_RPC_URL` in `frontend/.env.local`.
