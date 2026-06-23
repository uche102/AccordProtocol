import type { DashboardStat, Owner, Proposal } from "../types/accord";

// NOTE: This file provides pre-wired state for UI development.
// Wallet integration (Freighter) and live contract reads are tracked in
// https://github.com/thegreatfeez/accord-protocol/issues — contributions welcome.

export const MOCK_PROPOSALS: Proposal[] = [
  {
    id: 1,
    to: "GDQP2...K7X3",
    amount: "5,000",
    token: "USDC",
    description: "Q2 contractor payment — design sprint deliverables",
    approvals: 2,
    threshold: 3,
    status: "pending",
    deadline: "Jun 18, 2026",
    deadlineTs: 1781737200,
    createdAt: "2 hours ago",
  },
  {
    id: 2,
    to: "GBVNR...M2F9",
    amount: "12,500",
    token: "XLM",
    description: "Protocol audit deposit — security firm retainer",
    approvals: 3,
    threshold: 3,
    status: "ready",
    deadline: "Jun 20, 2026",
    deadlineTs: 1781910000,
    createdAt: "5 hours ago",
  },
  {
    id: 3,
    to: "GCXKT...P1A4",
    amount: "800",
    token: "USDC",
    description: "Infrastructure costs — Soroban RPC node hosting",
    approvals: 3,
    threshold: 3,
    status: "executed",
    deadline: "Jun 12, 2026",
    deadlineTs: 1781218800,
    createdAt: "1 day ago",
  },
  {
    id: 4,
    to: "GHMWQ...T9B2",
    amount: "250",
    token: "USDC",
    description: "Community event sponsorship",
    approvals: 1,
    threshold: 3,
    status: "expired",
    deadline: "Jun 8, 2026",
    deadlineTs: 1780873200,
    createdAt: "3 days ago",
  },
];

export const OWNERS: Owner[] = [
  { address: "GDQP2...K7X3", label: "You" },
  { address: "GBVNR...M2F9", label: "Signer 2" },
  { address: "GCXKT...P1A4", label: "Signer 3" },
];

export const BASE_DASHBOARD_STATS: DashboardStat[] = [
  { label: "Treasury", value: "48,200", sub: "USDC" },
  { label: "Threshold", value: "3 of 3", sub: "signers required" },
  { label: "Active", value: "0", sub: "proposals" },
  { label: "Executed", value: "12", sub: "all time" },
];
