import type { Proposal } from "../types/accord";
import { ProposalCard } from "../components/ProposalCard";

export function HistoryPage({
  historyProposals,
  onApprove,
}: {
  historyProposals: Proposal[];
  onApprove: (id: number) => void;
}) {
  return (
    <>
      <h2 className="font-semibold mb-4">Proposal History</h2>
      <div className="space-y-3">
        {historyProposals.map((proposal) => (
          <ProposalCard key={proposal.id} proposal={proposal} onApprove={onApprove} />
        ))}
      </div>
    </>
  );
}
