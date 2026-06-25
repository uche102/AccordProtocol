# Accord Protocol — Design Decisions

This document records the reasoning behind key choices made during the design of Accord Protocol. Its purpose is to help contributors and auditors evaluate proposed changes against original intent, rather than inferring rationale from code alone. Where a constraint or behaviour looks arbitrary at first glance, the explanation here should make the trade-off clear.

---

## Core Protocol Choices

### Transfer proposals are the only on-chain proposal type

Accord encodes only one kind of proposal: a token transfer from the multisig's treasury to a recipient. More general forms — off-chain text votes, parameter-change proposals, arbitrary contract invocations — were deliberately excluded.

The rationale is **simplicity and auditability**. A contract whose behaviour is fully determined by a narrow, well-understood operation (move tokens from A to B) is far easier to audit than one that can execute arbitrary calldata. Every additional proposal type would expand the attack surface and require new invariants to be proven correct. Teams that need governance over contract upgrades or parameter changes can layer that logic externally while using Accord purely for treasury releases.

### Active-proposal count is capped at 50

The `ACTCNT` guard prevents the number of simultaneously open proposals from exceeding 50. Any `create_proposal` call that would push the count above this limit returns `ActiveProposalLimitReached`.

The rationale is **bounded on-chain storage cost**. Each open proposal occupies one `("PROP", id)` ledger entry plus up to N `("APPR", id, owner)` entries. Without a cap, a high-throughput deployment could accumulate hundreds of persistent entries, making the maximum rent cost unbounded and difficult for operators to reason about. At 50 proposals × 20 owners = 1,050 entries, worst-case monthly storage cost is calculable and capped (see `ARCHITECTURE.md` Section 3).

### Owner list is capped at 20

The contract enforces a maximum of 20 owners at initialisation time.

The rationale combines **practical M-of-N upper bounds** with **linear-scan cost**. The owner set is stored as a `Vec<Address>` and several operations scan it linearly (ownership checks, approval counting). At 20 entries a linear scan is inexpensive and deterministic; beyond that, the gas cost of a scan grows linearly and the practical utility of adding more co-signers diminishes — real-world multisigs almost universally operate with far fewer than 20 parties. A more sophisticated data structure (e.g. a hash-set) would reduce scan cost but add contract complexity; the cap makes the simple approach safe.

### Maximum deadline is 90 days

Proposals must have a deadline no more than 90 days from the time of creation.

The rationale is **preventing indefinitely-pending proposals from consuming active-proposal budget**. A proposal that never expires would permanently occupy one slot of the 50-proposal cap, potentially blocking new proposals from being created if enough long-lived ones accumulate. A 90-day maximum ensures that stale proposals eventually expire and free their slot without requiring manual intervention. Teams with legitimate long-horizon requirements can re-create a proposal before the previous one expires.

### `ProposalStatus::Expired` is computed, not stored

The `Expired` status is derived at read time from the proposal's `deadline` field and the current ledger timestamp — it is never written to persistent storage as a status value.

The rationale is **avoiding the need for a cleanup transaction**. If `Expired` were a stored state, something would have to write it when the deadline passes: either a privileged keeper account, a user-triggered cleanup call, or a cron-like mechanism — all of which add complexity, trust assumptions, or gas costs. By deriving expiry on-demand, the contract stays stateless with respect to time: the deadline field plus the current time is the authoritative source of truth, and no on-chain write is required to "expire" a proposal.

---

## Intentional Omissions

### Weighted voting was excluded

Each owner has exactly one vote of equal weight. Weighted voting — where different owners carry different vote multipliers — was considered and rejected.

The primary use case for Accord (shared treasury management among a known group of principals) does not require weighted votes, and adding them would significantly complicate the approval counting logic, the threshold semantics, and the upgrade path. Teams that need weighted governance should consider a purpose-built governance token contract.

### Automatic on-chain proposal cleanup was excluded

The contract has no automatic mechanism to sweep expired proposals, reclaim their storage entries, or decrement `ACTCNT` when a deadline passes. Cleanup requires an explicit `cancel_expired` call.

Automatic cleanup would require either a privileged caller with a standing incentive to trigger the transaction, or a keeper/cron infrastructure external to the contract — both of which introduce trust surface or off-chain dependencies. The `cancel_expired` function exists precisely to let any owner perform cleanup at their own discretion, keeping the contract self-contained.

### Per-proposal quorum rules were excluded

All proposals in a single deployed Accord contract share the same approval threshold set at initialisation. There is no mechanism to create a proposal with a different quorum requirement.

A single threshold covers the primary use case (consistent M-of-N policy across all treasury actions) and keeps the contract surface small. Per-proposal quorum rules would require storing the required threshold inside each `Proposal` struct, adding complexity to execution logic and making it easier for a proposer to accidentally — or maliciously — set a weaker approval bar for a specific payout. Deployments with different quorum requirements for different asset classes should deploy separate Accord instances.

---

## Platform Choice

Accord is deployed on the **Stellar network using the Soroban smart contract runtime** for four reasons:

1. **Native stablecoin support.** USDC and EURC are issued natively on Stellar and settle in two to five seconds. Treasury management without cross-chain bridges is operationally simpler and eliminates a category of bridge-exploit risk.

2. **Low, predictable fees.** Soroban's resource-based fee model (compute, memory, storage) makes transaction costs small and calculable at simulation time — important for a multisig that may process many low-value payments.

3. **Built-in token interface.** Soroban's `TokenInterface` trait provides `transfer`, `balance`, `decimals`, and `symbol` as standard contract entry points. Accord can work with any compliant token without custom adapters.

4. **Simple Rust SDK.** The `soroban-sdk` crate provides idiomatic, type-safe storage and event APIs that map directly to the contract's data model, reducing the gap between intent and implementation.
