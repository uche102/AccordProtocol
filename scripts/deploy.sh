#!/usr/bin/env bash
# Deploy the Accord contract to Stellar testnet.
# Usage: bash scripts/deploy.sh [identity-name]
#
# Prerequisites:
#   - stellar-cli installed
#   - Identity created: stellar keys generate accord-deployer
#   - Identity funded: stellar keys fund accord-deployer --network testnet

set -euo pipefail

IDENTITY="${1:-accord-deployer}"
NETWORK="testnet"
WASM="target/wasm32v1-none/release/accord.wasm"

echo "==> Building contract WASM..."
stellar contract build

if [ ! -f "$WASM" ]; then
  echo "ERROR: WASM not found at $WASM. Did the build succeed?"
  exit 1
fi

echo "==> Setting network to $NETWORK..."
stellar network use "$NETWORK"

echo "==> Uploading WASM..."
WASM_HASH=$(stellar contract upload \
  --network "$NETWORK" \
  --source-account "$IDENTITY" \
  --wasm "$WASM")

echo "WASM hash: $WASM_HASH"

echo "==> Deploying contract..."
CONTRACT_ID=$(stellar contract deploy \
  --network "$NETWORK" \
  --source-account "$IDENTITY" \
  --wasm "$WASM")

echo ""
echo "=========================================="
echo "  Contract deployed successfully!"
echo "  Contract ID: $CONTRACT_ID"
echo "  Network: $NETWORK"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Add to frontend/.env.local:"
echo "     VITE_CONTRACT_ADDRESS=$CONTRACT_ID"
echo ""
echo "  2. Initialize the contract (replace OWNER_* with real addresses):"
echo "     stellar contract invoke \\"
echo "       --network $NETWORK \\"
echo "       --source-account $IDENTITY \\"
echo "       --id $CONTRACT_ID \\"
echo "       -- initialize \\"
echo "       --owners '[\"OWNER_1\",\"OWNER_2\",\"OWNER_3\"]' \\"
echo "       --threshold 2"
echo ""
echo "  3. Check the explorer:"
echo "     https://stellar.expert/explorer/testnet/contract/$CONTRACT_ID"
