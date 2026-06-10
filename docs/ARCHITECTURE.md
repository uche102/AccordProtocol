# Accord Protocol — Architecture

## 1. System Overview

```text
┌──────────────────────────────┐
│     Web Client (Vite/React)  │
│  Proposal UI + Approval UX   │
└──────────────┬───────────────┘
               │ Freighter signing
               ▼
┌──────────────────────────────┐
│  Stellar JS SDK + Soroban    │
│  (@stellar/stellar-sdk)      │
└──────────────┬───────────────┘
               │ invokeHostFunction / simulateTransaction
               ▼
┌──────────────────────────────┐
│  Soroban RPC (Testnet)       │
│  soroban-testnet.stellar.org │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  accord Contract (Rust)      │
│  contracts/accord/src/lib.rs │
└──────────────┬───────────────┘
               │ emits events / stores state
               ▼
┌──────────────────────────────┐
│  Frontend Event Polling      │
│  query proposals + events    │
└──────────────────────────────┘
```

## 2. Contract ↔ Frontend Data Mapping

| Contract Function | Purpose | Frontend Caller |
|---|---|---|
| `initialize(owners, threshold)` | One-shot init — sets owners and M-of-N threshold | Deployment script only |
| `create_proposal(proposer, to, amount, token, description, deadline)` | Creates a transfer proposal | Proposal creation form |
| `approve(approver, proposal_id)` | Owner casts an approval vote | Proposal card approve button |
| `revoke(approver, proposal_id)` | Owner withdraws their approval | Proposal card revoke button |
| `execute(executor, proposal_id)` | Executes a Ready proposal, transfers tokens | Proposal card execute button |
| `get_proposal(proposal_id)` | Reads a single proposal | Proposal detail page |
| `get_proposals_paged(offset, limit)` | Paginated proposal list | Dashboard list |
| `get_owners()` | Returns owner list | Settings / owners panel |
| `get_threshold()` | Returns approval threshold | Dashboard header stat |
| `is_owner(address)` | Checks ownership for a connected wallet | Wallet-connected gating |
| `has_approved(proposal_id, owner)` | Per-owner approval flag | Approval bar UI |

## 3. Storage Layout (Soroban)

### Instance Storage (low-cost, short TTL)
| Key | Type | Description |
|-----|------|-------------|
| `INIT` | `bool` | Initialization guard |
| `THRESH` | `u32` | Approval threshold |
| `NEXT` | `u64` | Monotonic proposal ID counter |
| `ACTCNT` | `u32` | Active proposal count (budget guard) |

### Persistent Storage (long TTL, bumped on access)
| Key | Type | Description |
|-----|------|-------------|
| `OWNERS` | `Vec<Address>` | Fixed owner set |
| `("PROP", id)` | `Proposal` | Per-proposal state |
| `("APPR", id, owner)` | `bool` | Per-owner approval flag per proposal |

### Proposal Struct Fields
```
id            u64
proposer      Address
to            Address
amount        i128          (token's native unit — stroop for XLM-derived tokens)
token         Address       (Soroban token contract)
description   String        (max 300 chars)
deadline      u64           (Unix timestamp)
approvals     u32
status        ProposalStatus
```

## 4. Proposal Lifecycle

```
create_proposal()
        │
        ▼
  [Pending] ──── approve() ────► (approvals < threshold)
        │                               │
        │         approve() ────────────► (approvals >= threshold)
        │                                         │
        ▼                                         ▼
   (deadline                                  [Ready]
    exceeded)                                    │
        │                                   execute()
        ▼                                        │
  [Expired]                                      ▼
                                           [Executed]

  revoke() can transition Ready → Pending at any point before execute().
```

## 5. Event Schema

| Topics | Data Type | Consumer |
|--------|-----------|----------|
| `("created",)` | `ProposalCreatedEvent { id, proposer, to, amount, threshold }` | Proposal feed |
| `("approved",)` | `ProposalApprovedEvent { id, approver, approvals, threshold }` | Approval bar update |
| `("revoked",)` | `ProposalRevokedEvent { id, approver, approvals }` | Approval bar update |
| `("executed",)` | `ProposalExecutedEvent { id, executor, to, amount }` | Execution history |

## 6. Frontend Polling Strategy

1. Load current proposals on mount, then poll every 15-30s for active proposals.
2. After a confirmed transaction (approve, execute), re-fetch the affected proposal immediately for optimistic UI.
3. Deduplicate events by `(ledger, topic, data-hash)`.
4. Back off on RPC failure: 1s → 2s → 4s, cap at 30s.

## 7. Token Handling

All token amounts are stored and transferred in the token's **smallest unit** (stroops for XLM: 1 stroop = 0.0000001 XLM). Use `BigInt` in the frontend — never `Number` for on-chain amounts.

| Token Amount | Stroops |
|---|---|
| 1.0 XLM | 10,000,000 |
| 100.5 XLM | 1,005,000,000 |

Frontend utilities should live in `frontend/src/lib/soroban.ts`:
- `toBaseUnit(amount: string, decimals: number): bigint`
- `fromBaseUnit(amount: bigint, decimals: number): string`
