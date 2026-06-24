import { describe, test, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useProposal } from "../useProposal";
import { getProposal } from "../../lib/contract";

vi.mock("../../lib/contract", () => ({
  getProposal: vi.fn(),
}));

describe("useProposal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("loads proposal successfully", async () => {
    const mockProposal = { id: 1, description: "Test 1" };
    vi.mocked(getProposal).mockResolvedValueOnce(mockProposal as any);

    const { result } = renderHook(() => useProposal(1));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.proposal).toEqual(mockProposal);
    expect(result.current.error).toBeNull();
    expect(getProposal).toHaveBeenCalledWith(1);
    expect(getProposal).toHaveBeenCalledTimes(1);
  });

  test("contract error sets error", async () => {
    vi.mocked(getProposal).mockRejectedValueOnce(new Error("RPC failed"));

    const { result } = renderHook(() => useProposal(99));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("RPC failed");
    expect(result.current.proposal).toBeNull();
  });

  test("changing IDs fetches new proposals", async () => {
    const p2 = { id: 2, description: "Test 2" };
    const p3 = { id: 3, description: "Test 3" };

    vi.mocked(getProposal)
      .mockResolvedValueOnce(p2 as any)
      .mockResolvedValueOnce(p3 as any);

    const { result, rerender } = renderHook(({ id }) => useProposal(id), {
      initialProps: { id: 2 },
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.proposal).toEqual(p2);

    rerender({ id: 3 });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.proposal).toEqual(p3);
    });
  });

  test("cache behaviour", async () => {
    const mockProposal = { id: 5, description: "Test 5" };
    vi.mocked(getProposal).mockResolvedValueOnce(mockProposal as any);

    const { result: result1 } = renderHook(() => useProposal(5));

    await waitFor(() => {
      expect(result1.current.loading).toBe(false);
    });
    
    // Second hook call should use cache
    const { result: result2 } = renderHook(() => useProposal(5));

    // Wait slightly to ensure no new calls were made
    await new Promise((r) => setTimeout(r, 10));

    expect(result2.current.loading).toBe(false);
    expect(result2.current.proposal).toEqual(mockProposal);
    
    // getProposal should only have been called ONCE for ID 5
    expect(getProposal).toHaveBeenCalledTimes(1);
  });
});
