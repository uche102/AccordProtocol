import { Link } from "react-router-dom";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-3xl text-center space-y-8 relative z-10">
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex justify-center mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-xl font-bold text-black shadow-lg shadow-emerald-500/20">
              A
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
            Accord Protocol
          </h1>
          <p className="mt-8 text-lg md:text-xl text-zinc-400 font-medium max-w-2xl mx-auto leading-relaxed">
            The decentralized multi-signature standard for trustless agreement and execution on Stellar.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <Link
            to="/app"
            className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            Launch App
          </Link>
          <a
            href="#"
            className="w-full sm:w-auto px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 font-semibold rounded-xl transition-all active:scale-95"
          >
            Read Docs
          </a>
        </div>
      </div>

      <footer className="absolute bottom-8 text-zinc-600 text-sm font-mono tracking-wider opacity-0 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
        SOROBAN TESTNET READY
      </footer>
    </div>
  );
}
