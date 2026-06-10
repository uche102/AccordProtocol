# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| testnet (current) | Yes |
| mainnet | Not yet deployed — audit pending |

## Audit Status

Accord Protocol is **unaudited**. Do not deploy to mainnet with significant funds until a formal third-party audit is completed. The contract has been reviewed for common Soroban anti-patterns but has not undergone a professional security review.

Known areas that require attention before mainnet:
- Reentrancy via external token calls (currently mitigated by Soroban's single-contract-call model, but warrants formal review)
- TTL expiry edge cases under high ledger load
- Owner-set immutability (no owner rotation yet — planned roadmap item)

## Responsible Disclosure

**Do not open a public GitHub issue for a security vulnerability.**

To report a security issue:

1. Navigate to the GitHub repository's **Security** tab.
2. Click **"Report a vulnerability"** to open a private advisory.
3. Describe the issue clearly: affected function(s), reproduction steps, and potential impact.

We aim to acknowledge reports within 72 hours and publish a fix within 14 days for confirmed Critical/High issues.

## In-Scope

- `contracts/accord/src/lib.rs` — the on-chain contract
- Contract ↔ frontend integration (authentication bypass, event spoofing)
- Denial-of-service patterns that make funds permanently inaccessible

## Out-of-Scope

- Stellar protocol-level issues (report to Stellar Development Foundation)
- Frontend-only UI bugs with no on-chain consequence
- Issues in third-party libraries we depend on (report upstream)

## Known Design Decisions

- **Fixed owner set:** Owners are set at initialization and cannot currently be changed. This is intentional in the current version to reduce attack surface during the early phase.
- **No spending limits:** Any owner can propose any amount up to the contract's balance. Access control relies entirely on the threshold mechanism.
- **Token validation at proposal time:** Token contract is validated at `create_proposal` not at `execute`. If a token contract is upgraded to be malicious between proposal creation and execution, this would be a risk. Owners should verify the token before approving.
