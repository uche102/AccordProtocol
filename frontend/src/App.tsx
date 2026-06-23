import { useState } from "react";
import { CreateProposalModal } from "./components/CreateProposalModal";
import { DashboardPage } from "./pages/DashboardPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { HistoryPage } from "./pages/HistoryPage";
import { SettingsPage } from "./pages/SettingsPage";
import { OwnersPage } from "./pages/OwnersPage";
import { useContract } from "./hooks/useContract";
import { useWallet } from "./hooks/useWallet";
<<<<<<< feature/wallet-ui-and-token-validation-23-26-30-34
import { approveProposal, executeProposal } from "./lib/submit";

type Page = "dashboard" | "history" | "settings" | "owners";
import { ProposalCardSkeleton } from "./components/ProposalCardSkeleton";
=======
// CHANGE 1: Import revokeProposal from submit.ts
import { approveProposal, executeProposal, revokeProposal } from "./lib/submit";

type Page = "dashboard" | "history" | "settings";
>>>>>>> main

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [showCreate, setShowCreate] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);
  const [txPending, setTxPending] = useState(false);

  const wallet = useWallet();
<<<<<<< feature/wallet-ui-and-token-validation-23-26-30-34
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!wallet.address) return;
    try {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  }
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
=======
  // CHANGE 2: Pass wallet.address into useContract so it can fetch userHasApproved
  const { proposals, owners, stats, loading, error, refresh } = useContract(wallet.address);
>>>>>>> main

  const activeProposals = proposals.filter((p) =>
    ["pending", "ready"].includes(p.status)
  );

  async function withTx(fn: () => Promise<void>) {
    if (!wallet.address) {
      await wallet.connect();
      return;
    }

    setTxError(null);
    setTxPending(true);

    try {
      await fn();
      refresh();
    } catch (e) {
      setTxError(e instanceof Error ? e.message : "Transaction failed");
    } finally {
      setTxPending(false);
    }
  }

  const handleApprove = (id: number) =>
    withTx(() => approveProposal(wallet.address!, id));

  const handleExecute = (id: number) =>
    withTx(() => executeProposal(wallet.address!, id));

  // CHANGE 3: Create the handleRevoke function
  const handleRevoke = (id: number) =>
    withTx(() => revokeProposal(wallet.address!, id));

  function shortenAddr(addr: string) {
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  }

  function handleGoHome() {
    setPage("dashboard");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 px-6 py-4">
        {/* ... (Keep your existing header code exactly the same) ... */}
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-xs font-bold text-black">
              A
            </div>
            <span className="font-semibold tracking-tight">Accord</span>
            <span className="text-xs text-zinc-600 font-mono hidden sm:block">
              testnet
            </span>
          </div>

          <nav className="flex items-center gap-1">
<<<<<<< feature/wallet-ui-and-token-validation-23-26-30-34
            {(["dashboard", "history", "owners", "settings"] as Page[]).map((navPage) => (
=======
            {(["dashboard", "history", "settings"] as Page[]).map((navPage) => (
>>>>>>> main
              <button
                key={navPage}
                type="button"
                onClick={() => setPage(navPage)}
<<<<<<< feature/wallet-ui-and-token-validation-23-26-30-34
            {[
              { label: "dashboard", to: "/" },
              { label: "history", to: "/history" },
              { label: "settings", to: "/settings" },
            ].map(({ label, to }) => (
              <Link
                key={label}
                to={to}
=======
>>>>>>> main
                className={`text-sm px-3 py-1.5 rounded-lg capitalize transition-colors ${
                  page === navPage
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {navPage}
              </button>
            ))}
          </nav>

          {!wallet.installed ? (
            <a
              href="https://www.freighter.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm px-4 py-1.5 rounded-lg font-medium bg-amber-600 hover:bg-amber-500 text-white transition-colors"
            >
              Install Freighter
            </a>
          ) : wallet.address ? (
            <div className="flex items-center gap-3">
              <div className="text-sm px-3 py-1 rounded-lg bg-zinc-800 text-zinc-300">
                <div>{shortenAddr(wallet.address)}</div>
                {wallet.xlmBalance != null && wallet.usdcBalance != null && (
                  <div className="text-xs text-zinc-400">
                    <span className="mr-3">{wallet.xlmBalance} XLM</span>
                    <span>{wallet.usdcBalance} USDC</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="text-sm px-3 py-1 rounded-lg font-medium bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>

              <button
                type="button"
                onClick={wallet.disconnect}
                className="text-sm px-3 py-1 rounded-lg font-medium bg-transparent text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={wallet.connect}
              disabled={wallet.connecting}
              className="text-sm px-4 py-1.5 rounded-lg font-medium bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition-colors"
            >
              {wallet.connecting ? "Connecting…" : "Connect Wallet"}
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {(txError || error) && !loading && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6 text-sm text-red-400 flex items-center justify-between">
            <span>{txError ?? error}</span>
            <button
              type="button"
              onClick={() => {
                setTxError(null);
                refresh();
              }}
              className="underline hover:text-red-300 ml-4 shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {txPending && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 mb-6 text-sm text-emerald-400">
            Waiting for confirmation…
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-zinc-500 text-sm">
            Loading contract data…
          </div>
        ) : page === "dashboard" ? (
          <DashboardPage
            activeProposals={activeProposals}
            owners={owners}
            dashboardStats={stats}
            walletAddress={wallet.address}
            onApprove={handleApprove}
            onExecute={handleExecute}
            onRevoke={handleRevoke} /* CHANGE 4: Pass the handleRevoke function down to the Dashboard */
            onCreateProposal={() => setShowCreate(true)}
          />
        ) : page === "history" ? (
          <HistoryPage proposals={proposals} onApprove={handleApprove} />
<<<<<<< feature/wallet-ui-and-token-validation-23-26-30-34
        ) : page === "owners" ? (
          <OwnersPage
            owners={owners}
            threshold={parseInt(stats.find((s) => s.label === "Threshold")?.value.split(" ")[0] || "0")}
            totalOwners={owners.length}
          />
          <HistoryPage
            historyProposals={historyProposals}
            onApprove={handleApprove}
          />
        ) : page === "settings" ? (
          <SettingsPage stats={stats} />
=======
>>>>>>> main
        ) : (
          <>
          <NotFoundPage onGoHome={handleGoHome} />
          <SettingsPage stats={stats} />
          </>
        )}
      </main>

      {showCreate && (
        <CreateProposalModal
          walletAddress={wallet.address}
          onClose={() => setShowCreate(false)}
          onSubmitted={refresh}
        />
      )}
    </div>
  );
}