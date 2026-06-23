interface NotFoundPageProps {
  onGoHome: () => void;
}

export function NotFoundPage({ onGoHome }: NotFoundPageProps) {
  return (
    <div className="text-center py-16">
      <h1 className="text-6xl font-bold mb-4">404</h1>

      <p className="text-zinc-400 mb-6">
        Page not found
      </p>

      <button
        type="button"
        onClick={onGoHome}
        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
      >
        Back to Dashboard
      </button>
    </div>
  );
}