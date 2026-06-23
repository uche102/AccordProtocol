import type { Owner } from "../types/accord";

type OwnersPageProps = {
  owners: Owner[];
  threshold: number;
  totalOwners: number;
};

export function OwnersPage({
  owners,
  threshold,
  totalOwners,
}: OwnersPageProps) {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">Multisig Owners</h1>
        <p className="text-zinc-400 text-sm">
          Requires {threshold} of {totalOwners} signers
        </p>
      </div>

      {owners.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-600 text-sm">No owners found.</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
          {owners.map((owner) => (
            <div
              key={owner.address}
              className="flex items-center gap-3 px-4 py-4"
            >
              <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-zinc-400">
                {owner.label[0]}
              </div>
              <div>
                <p className="text-sm text-zinc-300">{owner.label}</p>
                <p className="font-mono text-xs text-zinc-500">{owner.address}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
