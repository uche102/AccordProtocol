import { useEffect, useRef } from "react";
import { getContractEvents, getLatestLedger } from "../lib/contract";

export function useEventPolling(
  refresh: () => void | Promise<void>,
  intervalMs: number
) {
  const lastSeenLedger = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const currentLedger = await getLatestLedger();
        if (!cancelled) {
          lastSeenLedger.current = currentLedger;
        }
      } catch (err) {
        console.error("Failed to initialize event polling ledger checkpoint", err);
      }
    }

    init();

    const intervalId = setInterval(async () => {
      if (lastSeenLedger.current === null) {
        return;
      }

      try {
        const latest = await getContractEvents(lastSeenLedger.current);

        if (latest > lastSeenLedger.current && !cancelled) {
          await refresh();
          lastSeenLedger.current = latest;
        }
      } catch (err) {
        console.error("Error during event polling", err);
      }
    }, intervalMs);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [refresh, intervalMs]);
}
