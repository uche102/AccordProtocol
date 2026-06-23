import { useCallback, useEffect, useState } from "react";
import { connectWallet, freighterInstalled, getWalletAddress, getAccountBalances } from "../lib/wallet";

export type WalletState = {
  installed: boolean;
  address: string | null;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  xlmBalance?: string | null;
  usdcBalance?: string | null;
};

export function useWallet(): WalletState {
  const [installed, setInstalled] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [xlmBalance, setXlmBalance] = useState<string | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null);

  // On mount: check if Freighter is present and already authorized
  useEffect(() => {
    freighterInstalled().then((ok) => {
      setInstalled(ok);
      if (ok) {
        getWalletAddress().then((res) => {
          if (res.ok) setAddress(res.value);
        });
      }
    });
  }, []);

  // Fetch balances whenever address becomes non-null. Swallow errors silently.
  useEffect(() => {
    if (!address) {
      setXlmBalance(null);
      setUsdcBalance(null);
      return;
    }

    getAccountBalances(address)
      .then((res) => {
        setXlmBalance(res.xlm);
        setUsdcBalance(res.usdc);
      })
      .catch(() => {
        // ignore failures — keep balances null
      });
  }, [address]);

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      const res = await connectWallet();
      if (res.ok) setAddress(res.value);
      else alert(`Freighter error: ${res.error}`);
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    // Freighter has no programmatic disconnect — clear local state only.
    setAddress(null);
    setXlmBalance(null);
    setUsdcBalance(null);
  }, []);

  return { installed, address, connecting, connect, disconnect, xlmBalance, usdcBalance };
}
