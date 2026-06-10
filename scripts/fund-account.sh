#!/usr/bin/env bash
# Fund a Stellar account on testnet using Friendbot.
# Usage: bash scripts/fund-account.sh [identity-name]

set -euo pipefail

IDENTITY="${1:-accord-deployer}"

PUBLIC_KEY=$(stellar keys public-key "$IDENTITY" 2>/dev/null || true)

if [ -z "$PUBLIC_KEY" ]; then
  echo "Identity '$IDENTITY' not found. Creating it now..."
  stellar keys generate "$IDENTITY"
  PUBLIC_KEY=$(stellar keys public-key "$IDENTITY")
  echo "Created identity: $IDENTITY"
fi

echo "Funding $IDENTITY ($PUBLIC_KEY) via Friendbot..."
curl -s "https://friendbot.stellar.org?addr=$PUBLIC_KEY" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print('OK' if 'hash' in d else d)" 2>/dev/null || \
  echo "Friendbot returned an unexpected response — the account may already be funded."

echo ""
echo "Account: $PUBLIC_KEY"
echo "Explorer: https://stellar.expert/explorer/testnet/account/$PUBLIC_KEY"
