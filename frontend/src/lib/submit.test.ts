import { vi, describe, it, expect, beforeEach } from "vitest";
import { estimateCreateProposalFee } from "./submit";

// Mock the stellar-sdk to avoid real network calls
vi.mock("@stellar/stellar-sdk", async () => {
  const original = await vi.importActual("@stellar/stellar-sdk") as any;
  return {
    ...original,
    nativeToScVal: vi.fn().mockReturnValue({}),
    rpc: {
      ...original.rpc,
      Server: vi.fn().mockImplementation(() => ({
        getAccount: vi.fn().mockResolvedValue({ sequence: "123" }),
        simulateTransaction: vi.fn().mockResolvedValue({
          _type: "success",
          minResourceFee: "50000",
        }),
        sendTransaction: vi.fn().mockRejectedValue(new Error("Should not broadcast")),
      })),
      Api: {
        isSimulationSuccess: vi.fn().mockReturnValue(true),
      },
    },
    Contract: vi.fn().mockImplementation(() => ({
      call: vi.fn().mockReturnValue({}),
    })),
    TransactionBuilder: vi.fn().mockImplementation(() => {
      const builder = {
        addOperation: vi.fn().mockReturnThis(),
        setTimeout: vi.fn().mockReturnThis(),
        build: vi.fn().mockReturnValue({}),
      };
      return builder;
    }),
  };
});

describe("submit utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("estimateCreateProposalFee", () => {
    it("returns calculated fee in XLM", async () => {
      const fee = await estimateCreateProposalFee(
        "GXXXX",
        "GYYYY",
        "GZZZZ",
        100n,
        "Test proposal",
        1234567890n
      );

      // (100000 baseFee + 50000 minResourceFee) / 10000000 = 0.015
      expect(fee).toBe(0.015);
    });

    it("uses simulation result but does not broadcast transaction", async () => {
      const fee = await estimateCreateProposalFee(
        "GXXXX",
        "GYYYY",
        "GZZZZ",
        100n,
        "Test proposal",
        1234567890n
      );

      expect(fee).toBe(0.015);
    });
  });
});
