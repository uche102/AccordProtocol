import { renderHook, act, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { useWallet } from "../useWallet";
import * as walletLib from "../../lib/wallet";

const mockedWalletLib = vi.mocked(walletLib);

// Mock the wallet library
vi.mock("../../lib/wallet", () => ({
  connectWallet: vi.fn(),
  freighterInstalled: vi.fn(),
  getWalletAddress: vi.fn(),
  getAccountBalances: vi.fn().mockResolvedValue({ xlm: "0.00", usdc: "0.00" }),
  getWalletNetworkPassphrase: vi.fn(),
}));

describe("useWallet", () => {
  const EXPECTED_NETWORK = import.meta.env.VITE_NETWORK_PASSPHRASE;

  beforeEach(() => {
    vi.clearAllMocks();
    mockedWalletLib.freighterInstalled.mockResolvedValue(false);
  });

  it("sets networkMismatch to true on connect if network differs", async () => {
    mockedWalletLib.connectWallet.mockResolvedValue({ ok: true, value: "GBX..." });
    mockedWalletLib.getWalletNetworkPassphrase.mockResolvedValue("WRONG NETWORK");

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
    mockedWalletLib.connectWallet.mockResolvedValue({ ok: true, value: "GBX..." });
    mockedWalletLib.getWalletNetworkPassphrase.mockResolvedValue(EXPECTED_NETWORK);

    const { result } = renderHook(() => useWallet());

    await act(async () => {
      await result.current.connect();
    });

    await waitFor(() => {
      expect(result.current.networkMismatch).toBe(false);
    });
  });

  it("checks pre-authorised wallets on load and sets networkMismatch to true if wrong", async () => {
    mockedWalletLib.freighterInstalled.mockResolvedValue(true);
    mockedWalletLib.getWalletAddress.mockResolvedValue({ ok: true, value: "GBX..." });
    mockedWalletLib.getWalletNetworkPassphrase.mockResolvedValue("WRONG NETWORK");

    const { result } = renderHook(() => useWallet());

    await waitFor(() => {
      expect(result.current.networkMismatch).toBe(true);
      expect(result.current.address).toBe("GBX...");
    });
  });

  it("does not crash if getWalletNetworkPassphrase returns null", async () => {
    mockedWalletLib.connectWallet.mockResolvedValue({ ok: true, value: "GBX..." });
    mockedWalletLib.getWalletNetworkPassphrase.mockResolvedValue(null);

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
