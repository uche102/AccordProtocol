import { useCallback, useEffect, useState } from "react";
import type { Proposal } from "../types/accord";
import { ApprovalBar } from "./ApprovalBar";
import { StatusBadge } from "./StatusBadge";

type ProposalCardProps = {
  proposal: Proposal;
  walletAddress: string | null;
  onApprove: (id: number) => void;
  onExecute: (id: number) => void;
};

export function ProposalCard({
  proposal,
  walletAddress,
  onApprove,
  onExecute,
}: ProposalCardProps) {
  const connected = !!walletAddress;

  const getCountdownText = useCallback(() => {
    if (proposal.status === "executed") {
      return proposal.deadline;
    }
    const now = Math.floor(Date.now() / 1000);
    const diff = proposal.deadlineTs - now;

    if (diff <= 0) {
      return "Expired";
    }

    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  }, [proposal]);

  const [countdown, setCountdown] = useState<string>(getCountdownText());

  useEffect(() => {
    if (proposal.status === "executed") {
      return;
    }

    const interval = setInterval(() => {
      setCountdown(getCountdownText());
    }, 60000);

    return () => clearInterval(interval);
  }, [getCountdownText, proposal.status]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-zinc-500 font-mono mb-1">
            Proposal #{proposal.id}
          </p>
          <p className="text-white font-semibold">
            Send {proposal.amount} {proposal.token}
          </p>
          <p className="text-zinc-500 text-sm font-mono mt-0.5">
            → {proposal.to}
          </p>
          {proposal.description && (
            <p className="text-zinc-500 text-xs mt-1.5 leading-relaxed max-w-sm">
              {proposal.description}
            </p>
          )}
        </div>
        <StatusBadge status={proposal.status} />
      </div>

      <div className="flex items-center justify-between mt-4">
        <ApprovalBar approvals={proposal.approvals} threshold={proposal.threshold} />

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-600">{countdown}</span>

          {proposal.status === "pending" && (
            <button
              type="button"
              onClick={() => onApprove(proposal.id)}
              title={connected ? undefined : "Connect wallet to approve"}
              className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg transition-colors font-medium disabled:opacity-50"
            >
              {connected ? "Approve" : "Connect & Approve"}
            </button>
          )}

          {proposal.status === "ready" && (
            <button
              type="button"
              onClick={() => onExecute(proposal.id)}
              title={connected ? undefined : "Connect wallet to execute"}
              className="text-xs bg-sky-600 hover:bg-sky-500 text-white px-3 py-1 rounded-lg transition-colors font-medium disabled:opacity-50"
            >
              {connected ? "Execute" : "Connect & Execute"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
