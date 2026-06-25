# Approve and Execute a Proposal

Approving and executing a proposal are two separate actions in Accord. Approval records that an owner agrees with the request, while execution is the final on-chain step that actually applies the transfer or governance change once the threshold has been met.

When you review a proposal, check the description, amount, token, recipient, and deadline before you sign. If enough owners approve it before the deadline, the proposal becomes Ready and any owner can execute it, but it can still fall back to Pending if an approval is revoked first. For the status rules and contract errors tied to each step, see [understanding-proposal-lifecycle.md](./understanding-proposal-lifecycle.md) and [../CONTRACT_API.md](../CONTRACT_API.md).

If a Ready proposal sits too long, it can still expire before execution, so teams should coordinate the last-mile execution step rather than assuming the approval threshold alone completes the work. For operational cautions around signer behavior and trust assumptions, see [../SECURITY.md](../SECURITY.md).
