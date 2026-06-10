import type { Proposal } from "../types/accord";
import { ApprovalBar } from "./ApprovalBar";
import { StatusBadge } from "./StatusBadge";

type ProposalCardProps = {
  proposal: Proposal;
  onApprove: (id: number) => void;
};

export function ProposalCard({ proposal, onApprove }: ProposalCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-zinc-500 font-mono mb-1">Proposal #{proposal.id}</p>
          <p className="text-white font-semibold">
            Send {proposal.amount} {proposal.token}
          </p>
          <p className="text-zinc-500 text-sm font-mono mt-0.5">→ {proposal.to}</p>
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
          <span className="text-xs text-zinc-600">{proposal.createdAt}</span>
          {proposal.status === "pending" && (
            <button
              type="button"
              onClick={() => onApprove(proposal.id)}
              className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg transition-colors font-medium"
            >
              Approve
            </button>
          )}
          {proposal.status === "ready" && (
            <button
              type="button"
              className="text-xs bg-sky-600 hover:bg-sky-500 text-white px-3 py-1 rounded-lg transition-colors font-medium"
            >
              Execute
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
