# How to Create a Payment Proposal

By the end of this tutorial you will have submitted a live payment proposal on Stellar testnet.

---

## Prerequisites

Before you begin, make sure you have:

- **Freighter** installed in your browser and unlocked
- Your Freighter wallet **connected to Stellar testnet** (not mainnet)
- Your wallet address **registered as an owner** of the Accord multisig contract

If you have not yet set up the wallet connection or registered as an owner, see [Deploy Your Own Multisig](./deploy-your-own-multisig.md) before continuing.

---

## Steps

### 1. Open the Dashboard

Navigate to the Accord web application. You should land on the Dashboard, which lists all active proposals and shows your connected wallet address in the header.

If your wallet is not yet connected, click **Connect Wallet** in the top-right corner and approve the connection request in Freighter.

### 2. Open the New Proposal form

Click the **+ New** button in the top-right area of the Active Proposals section. A modal titled **New Proposal** will appear.

### 3. Confirm the Proposer address

The **Proposer** field is pre-filled with your connected wallet address and cannot be edited. Verify that it shows the correct address before continuing. If it shows the wrong address, close the modal, disconnect your wallet, and reconnect with the correct account.

### 4. Enter the recipient address

In the **Recipient Address** field, type or paste the full Stellar public key of the account that should receive the payment. The address must start with `G` and be a valid Ed25519 public key. An inline error will appear if the address is malformed — correct it before moving on.

The recipient cannot be the contract's own address.

### 5. Enter the amount and select a token

In the **Amount** field, enter the number of tokens to send. The value must be greater than zero.

Next to the amount field, select the token you want to send by clicking one of the three token buttons: **XLM**, **USDC**, or **EURC**. The selected token is highlighted in green. Only one token can be chosen per proposal.

### 6. Write a description

In the **Description** field, write a short note explaining the purpose of the payment. The description must be between 1 and 300 characters. Good descriptions help other owners understand what they are approving before they sign.

### 7. Set a deadline

The **Deadline** field defaults to seven days from today. Click the date picker to choose a different date. The deadline must be at least one day in the future and no more than 90 days away. If the proposal is not executed before this date, it will expire automatically and cannot be recovered.

### 8. Review the fee estimate

Once the Recipient Address, Amount, and Description fields are all filled in, a fee estimate panel appears at the bottom of the form. Click **Calculate fee** to request a live simulation from the network. The panel will display the estimated Stellar network fee in XLM (for example, `~0.0001000 XLM`). This is the fee for submitting the transaction — it does not come from the proposal amount itself.

If the estimate cannot be retrieved, you can still proceed; the fee will be calculated when Freighter signs the transaction.

### 9. Submit and confirm in Freighter

Click **Submit Proposal**. The button will show **Submitting…** while the transaction is prepared.

Freighter will open automatically and display a transaction signing request. Review the details shown in Freighter — recipient, amount, and fee — and click **Sign** to authorise the transaction.

Once the transaction is confirmed on-chain, the modal closes and the dashboard refreshes.

---

## What happens next

Your new proposal now appears on the Dashboard with a **Pending** status. Other registered owners can see it, review the details, and begin approving it. The proposal remains open until the deadline passes or it is executed. Once enough owners have approved it to meet the multisig threshold, its status will change to **Ready** and any owner can trigger execution.

---

## Next steps

- **Approve and execute a proposal** — once other owners have submitted their approvals, follow the [Approve and Execute a Proposal](./approve-and-execute-a-proposal.md) tutorial to complete the payment.
- **Understand the contract** — see [`docs/CONTRACT_API.md`](../CONTRACT_API.md) for the full parameter reference and error codes for `create_proposal`.
