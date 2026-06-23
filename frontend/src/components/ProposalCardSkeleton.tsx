export function ProposalCardSkeleton() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-2">
          {/* Proposal ID placeholder */}
          <div className="h-3 w-20 bg-zinc-800 rounded" />
          {/* Proposal title placeholder */}
          <div className="h-5 w-48 bg-zinc-800 rounded" />
          {/* Proposal recipient placeholder */}
          <div className="h-4 w-60 bg-zinc-800 rounded" />
        </div>
        {/* Status Badge placeholder */}
        <div className="h-5 w-16 bg-zinc-800 rounded-full" />
      </div>

      <div className="flex items-center justify-between mt-4">
        {/* Approval progress placeholder */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-zinc-800" />
            <div className="w-2 h-2 rounded-full bg-zinc-800" />
            <div className="w-2 h-2 rounded-full bg-zinc-800" />
          </div>
          <div className="h-3 w-6 bg-zinc-800 rounded" />
        </div>

        {/* Date and Button placeholder */}
        <div className="flex items-center gap-2">
          <div className="h-3 w-12 bg-zinc-800 rounded" />
          <div className="h-7 w-20 bg-zinc-800 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
