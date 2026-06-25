# How to Approve and Execute a Proposal

By the end of this tutorial you will have approved a payment proposal and, once the threshold is met, executed it to transfer funds on Stellar testnet.

---

## Prerequisites

Before you begin, make sure you have:

- **Freighter** installed in your browser and unlocked
- Your Freighter wallet **connected to Stellar testnet** (not mainnet)
- Your wallet address **registered as an owner** of the Accord multisig contract
- A proposal that already exists and has a status of **Pending** or **Ready**

If you need to create a proposal first, follow the [Create a Payment Proposal](./create-a-payment-proposal.md) tutorial before continuing.

---

## Steps

### 1. Find the proposal on the Dashboard

Navigate to the Accord web application. The **Dashboard** lists all active proposals under the Active Proposals heading. Each proposal card shows the proposal ID, the amount and token being sent, the recipient address, the proposer's address, and the current approval count relative to the threshold.

Locate the proposal you want to approve. If many proposals are listed, enable the **Expiring first** toggle to surface proposals whose deadlines are approaching soonest.

### 2. Review the proposal details before approving

Before clicking Approve, read the proposal card carefully:

- **Recipient address** — confirm this is the correct destination account. Once executed, the transfer cannot be reversed.
- **Amount and token** — confirm the amount is correct and the token (XLM, USDC, or EURC) matches what was agreed.
- **Description** — read the proposer's note to understand the purpose of the payment.
- **Deadline** — check that the deadline has not passed. An expired proposal cannot be approved or executed.
- **Approval bar** — the progress bar shows how many owners have approved so far versus the threshold required.

### 3. Click Approve and confirm in Freighter

When you are satisfied with the proposal details, click the **Approve** button on the proposal card.

Freighter will open automatically with a transaction signing request. Review the details shown in Freighter and click **Sign** to authorise your approval. Your signature is submitted on-chain and the approval count on the card updates immediately.

You can only approve a proposal once. If you change your mind before execution, click **Revoke** to withdraw your approval — this is available as long as the proposal has not been executed.

### 4. Check whether the threshold is now met

After your approval is recorded, look at the proposal card's status badge:

- **Pending** — the approval count is still below the required threshold. Other owners need to approve before the proposal can be executed.
- **Ready** — the threshold has been reached. The proposal is now eligible for execution.

If the Dashboard banner reads "X proposals are ready to execute", the threshold has been met and you (or any other owner) can proceed to the next step.

### 5. Execute the proposal

Once a proposal's status is **Ready**, an **Execute** button appears on the proposal card. Any registered owner can trigger execution — it does not have to be the same person who proposed or approved it.

Click **Execute**. A confirmation prompt will appear inline on the card, asking "Send this transaction?". Click **Confirm** to proceed, or **Cancel** to go back without executing.

After you click **Confirm**, Freighter will open with a final signing request for the execution transaction. Review the details and click **Sign** to authorise the transfer. The contract will send the specified amount of the token from the multisig contract to the recipient's address.

Once the transaction is confirmed on-chain, the proposal's status changes to **Executed** and it moves off the Active Proposals list.

---

## What if the deadline passes?

If a proposal's deadline passes before it is executed, its status automatically changes to **Expired**. An expired proposal cannot be approved, executed, or recovered — no action will change its outcome. The funds remain in the multisig contract.

If the payment is still needed, a new proposal must be created from the beginning. Any owner can do this by following the [Create a Payment Proposal](./create-a-payment-proposal.md) tutorial.

---

## Next steps

- **Create a new proposal** — see [Create a Payment Proposal](./create-a-payment-proposal.md) to start the flow from the beginning.
- **Understand the contract** — see [`docs/CONTRACT_API.md`](../CONTRACT_API.md) for the full parameter reference and error codes for `approve` and `execute`.
