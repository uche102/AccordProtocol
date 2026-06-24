import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, test, expect, beforeEach } from "vitest";
import type { Proposal } from "../types/accord";
import { ProposalCard } from "./ProposalCard";

vi.mock("../hooks/useContract", () => ({
  useContract: () => ({
    proposals: [{ id: 1, status: "pending" }],
    owners: [],
    ownerAddresses: [],
    stats: [],
    loading: false,
    error: null,
    refresh: () => undefined,
  }),
}));

const baseProposal = (overrides: Partial<Proposal> = {}): Proposal => ({
  id: 42,
  to: "GABCDE...WXYZ",
  amount: "100",
  token: "USDC",
  description: "Test proposal",
  approvals: 1,
  threshold: 2,
  status: "pending",
  deadline: "Jun 24, 2026",
  createdAt: "2026-06-24",
  proposer: "GBXGJZUFVB2F3J2Y5B4S4V6JWYD2H4O3T7XQZT5XKV6S2J5N6Z2Z2Z2Z",
  createdAt: "proposal #42",
  proposer: "GPROPO...SER1",
  userHasApproved: false,
  ...overrides,
});

describe("ProposalCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("shows Approve for a pending proposal when wallet is connected", () => {
    render(
      <ProposalCard
        proposal={baseProposal()}
        walletAddress="GCONNECTED123"
        onApprove={vi.fn()}
        onExecute={vi.fn()}
        onRevoke={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Approve" })).toBeTruthy();
  });

  test("shows Connect & Approve for a pending proposal without a wallet", () => {
    render(
      <ProposalCard
        proposal={baseProposal()}
        walletAddress={null}
        onApprove={vi.fn()}
        onExecute={vi.fn()}
        onRevoke={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Connect & Approve" })).toBeTruthy();
  });

  test("shows Execute for a ready proposal and hides Approve", () => {
    render(
      <ProposalCard
        proposal={baseProposal({ status: "ready" })}
        walletAddress="GCONNECTED123"
        onApprove={vi.fn()}
        onExecute={vi.fn()}
        onRevoke={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Execute" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Approve" })).toBeNull();
  });

  test.each(["executed", "expired"] as const)(
    "hides action buttons for %s proposals",
    (status) => {
      render(
        <ProposalCard
          proposal={baseProposal({ status })}
          walletAddress="GCONNECTED123"
          onApprove={vi.fn()}
          onExecute={vi.fn()}
          onRevoke={vi.fn()}
        />
      );

      expect(screen.queryByRole("button", { name: "Approve" })).toBeNull();
      expect(screen.queryByRole("button", { name: "Execute" })).toBeNull();
      expect(screen.queryByRole("button", { name: "Connect & Approve" })).toBeNull();
    }
  );

  test("calls onApprove with the proposal id", async () => {
    const user = userEvent.setup();
    const onApprove = vi.fn();

    render(
      <ProposalCard
        proposal={baseProposal()}
        walletAddress="GCONNECTED123"
        onApprove={onApprove}
        onExecute={vi.fn()}
        onRevoke={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "Approve" }));

    expect(onApprove).toHaveBeenCalledTimes(1);
    expect(onApprove).toHaveBeenCalledWith(42);
  });
});
