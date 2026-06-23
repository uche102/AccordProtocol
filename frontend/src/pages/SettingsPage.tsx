import type { DashboardStat } from "../types/accord";

type SettingsPageProps = {
  stats: DashboardStat[];
};

export function SettingsPage({ stats }: SettingsPageProps) {
  const contractId = import.meta.env.VITE_CONTRACT_ADDRESS ?? "Unknown";
  const network = import.meta.env.VITE_NETWORK_PASSPHRASE ?? "Unknown";
  const threshold = stats.find((stat) => stat.label === "Threshold")?.value ?? "Unknown";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Reference information for your deployed contract and connected network.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="text-sm text-zinc-500 mb-2">Contract ID</div>
          <div className="font-mono text-sm text-zinc-100 break-all">{contractId}</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="text-sm text-zinc-500 mb-2">Network</div>
          <div className="text-sm text-zinc-100">{network}</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="text-sm text-zinc-500 mb-2">Threshold</div>
          <div className="text-sm text-zinc-100">{threshold}</div>
        </div>
      </div>
    </div>
  );
}
