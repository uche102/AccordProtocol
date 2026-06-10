import type { DashboardStat, Owner, Proposal } from "../types/accord";
import { ProposalCard } from "../components/ProposalCard";
import { StatCard } from "../components/StatCard";

type DashboardPageProps = {
  activeProposals: Proposal[];
  owners: Owner[];
  dashboardStats: DashboardStat[];
  onApprove: (id: number) => void;
  onCreateProposal: () => void;
};

export function DashboardPage({
  activeProposals,
  owners,
  dashboardStats,
  onApprove,
  onCreateProposal,
}: DashboardPageProps) {
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {dashboardStats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} sub={s.sub} />
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Active Proposals</h2>
        <button
          type="button"
          onClick={onCreateProposal}
          className="text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg transition-colors"
        >
          + New
        </button>
      </div>

      <div className="space-y-3">
        {activeProposals.length === 0 ? (
          <p className="text-zinc-600 text-sm py-8 text-center">No active proposals</p>
        ) : (
          activeProposals.map((p) => <ProposalCard key={p.id} proposal={p} onApprove={onApprove} />)
        )}
      </div>

      <div className="mt-8">
        <h2 className="font-semibold mb-4">Signers</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
          {owners.map((owner) => (
            <div key={owner.address} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-zinc-400">
                  {owner.label[0]}
                </div>
                <span className="font-mono text-sm text-zinc-300">{owner.address}</span>
              </div>
              {owner.label === "You" && (
                <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  you
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
