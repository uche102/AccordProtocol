import { renderHook, act, waitFor } from "@testing-library/react";
import { useWallet } from "../useWallet";
import * as walletLib from "../../lib/wallet";

// Mock the wallet library
jest.mock("../../lib/wallet", () => ({
  connectWallet: jest.fn(),
  freighterInstalled: jest.fn(),
  getWalletAddress: jest.fn(),
  getAccountBalances: jest.fn().mockResolvedValue({ xlm: "0.00", usdc: "0.00" }),
  getWalletNetworkPassphrase: jest.fn(),
}));

describe("useWallet", () => {
  const EXPECTED_NETWORK = import.meta.env.VITE_NETWORK_PASSPHRASE;

  beforeEach(() => {
    jest.clearAllMocks();
    (walletLib.freighterInstalled as jest.Mock).mockResolvedValue(false);
  });

  it("sets networkMismatch to true on connect if network differs", async () => {
    (walletLib.connectWallet as jest.Mock).mockResolvedValue({ ok: true, value: "GBX..." });
    (walletLib.getWalletNetworkPassphrase as jest.Mock).mockResolvedValue("WRONG NETWORK");

    const { result } = renderHook(() => useWallet());

    await act(async () => {
      await result.current.connect();
    });

    await waitFor(() => {
      expect(result.current.networkMismatch).toBe(true);
      expect(result.current.address).toBe("GBX...");
    });
  });

  it("sets networkMismatch to false on connect if network is correct", async () => {
    (walletLib.connectWallet as jest.Mock).mockResolvedValue({ ok: true, value: "GBX..." });
    (walletLib.getWalletNetworkPassphrase as jest.Mock).mockResolvedValue(EXPECTED_NETWORK);

    const { result } = renderHook(() => useWallet());

    await act(async () => {
      await result.current.connect();
    });

    await waitFor(() => {
      expect(result.current.networkMismatch).toBe(false);
    });
  });

  it("checks pre-authorised wallets on load and sets networkMismatch to true if wrong", async () => {
    (walletLib.freighterInstalled as jest.Mock).mockResolvedValue(true);
    (walletLib.getWalletAddress as jest.Mock).mockResolvedValue({ ok: true, value: "GBX..." });
    (walletLib.getWalletNetworkPassphrase as jest.Mock).mockResolvedValue("WRONG NETWORK");

    const { result } = renderHook(() => useWallet());

    await waitFor(() => {
      expect(result.current.networkMismatch).toBe(true);
      expect(result.current.address).toBe("GBX...");
    });
  });

  it("does not crash if getWalletNetworkPassphrase returns null", async () => {
    (walletLib.connectWallet as jest.Mock).mockResolvedValue({ ok: true, value: "GBX..." });
    (walletLib.getWalletNetworkPassphrase as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useWallet());

    await act(async () => {
      await result.current.connect();
    });

    await waitFor(() => {
      // null means failure, but actual !== null will prevent it from evaluating to true
      // So networkMismatch will remain false, or evaluate properly without crashing.
      // (actual !== null && actual !== expected) -> (null !== null) is false
      expect(result.current.networkMismatch).toBe(false);
      expect(result.current.address).toBe("GBX...");
    });
  });
});
