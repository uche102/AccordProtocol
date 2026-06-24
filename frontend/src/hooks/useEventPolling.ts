import { useEffect, useRef } from "react";
import { rpc } from "@stellar/stellar-sdk";

const RPC_URL = import.meta.env.VITE_SOROBAN_RPC_URL as string;
const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ADDRESS as string;

const server = new rpc.Server(RPC_URL);

export function useEventPolling(refresh: () => void, baseInterval: number = 5000) {
  const lastLedger = useRef<number>(0);
  const failureCount = useRef<number>(0);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function poll() {
      if (isCancelled) return;

      try {
        if (lastLedger.current === 0) {
          const latestResponse = await server.getLatestLedger();
          lastLedger.current = latestResponse.sequence;
        } else {
          const latestResponse = await server.getLatestLedger();
          const currentLatest = latestResponse.sequence;

          if (currentLatest > lastLedger.current) {
            const response = await server.getEvents({
              startLedger: lastLedger.current + 1,
              filters: [
                {
                  type: "contract",
                  contractIds: [CONTRACT_ID],
                },
              ],
            });

            lastLedger.current = currentLatest;

            if (response.events && response.events.length > 0) {
              refresh();
            }
          }
        }

        // Success: reset failure count
        failureCount.current = 0;
      } catch (err) {
        // Failure: increment failure count
        failureCount.current += 1;
        console.error("RPC polling failure:", err);
      }

      if (isCancelled) return;

      // Calculate next delay:
      // - 0 failures: use baseInterval (e.g. 5000ms)
      // - >= 1 failure: doubling delay sequence (1s -> 2s -> 4s -> ...), capped at 30s
      let nextDelay = baseInterval;
      if (failureCount.current > 0) {
        nextDelay = Math.min(1000 * Math.pow(2, failureCount.current - 1), 30000);
      }

      timeoutId.current = setTimeout(poll, nextDelay);
    }

    poll();

    return () => {
      isCancelled = true;
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, [refresh, baseInterval]);
import { getLatestLedger, getContractEvents } from "../lib/contract";

export function useEventPolling(refresh: () => void | Promise<void>, intervalMs: number) {
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
      if (lastSeenLedger.current === null) return;

      try {
        const latest = await getContractEvents(lastSeenLedger.current);
        
        // If the latest event ledger is greater than what we've seen,
        // it means there are new on-chain events.
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
