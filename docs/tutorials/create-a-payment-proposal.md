# Create a Payment Proposal

Creating a payment proposal in Accord means choosing a recipient, amount, token, description, and deadline, then submitting that request on-chain as an owner. The goal is to make the requested transfer easy for the other signers to review before they decide whether to approve it.

Before you submit, confirm that the wallet you connected is one of the configured owners, that the recipient address is correct, and that the deadline gives the other signers enough time to review the request. For the contract rules behind creation, see [../CONTRACT_API.md](../CONTRACT_API.md) and [understanding-proposal-lifecycle.md](./understanding-proposal-lifecycle.md).

After submission, expect the new item to appear as Pending until enough owners approve it. Once it does, the next workflow is approving and executing it safely, which is covered in [approve-and-execute-a-proposal.md](./approve-and-execute-a-proposal.md).
