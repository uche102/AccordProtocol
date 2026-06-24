import { estimateCreateProposalFee } from "./submit";
import { rpc } from "@stellar/stellar-sdk";

// Mock the stellar-sdk to avoid real network calls
jest.mock("@stellar/stellar-sdk", () => {
  const original = jest.requireActual("@stellar/stellar-sdk");
  return {
    ...original,
    rpc: {
      ...original.rpc,
      Server: jest.fn().mockImplementation(() => ({
        getAccount: jest.fn().mockResolvedValue({ sequence: "123" }),
        simulateTransaction: jest.fn().mockResolvedValue({
          _type: "success",
          minResourceFee: "50000",
        }),
        sendTransaction: jest.fn().mockRejectedValue(new Error("Should not broadcast")),
      })),
      Api: {
        isSimulationSuccess: jest.fn().mockReturnValue(true),
      },
    },
    Contract: jest.fn().mockImplementation(() => ({
      call: jest.fn().mockReturnValue({}),
    })),
    TransactionBuilder: jest.fn().mockImplementation(() => {
      const builder = {
        addOperation: jest.fn().mockReturnThis(),
        setTimeout: jest.fn().mockReturnThis(),
        build: jest.fn().mockReturnValue({}),
      };
      return builder;
    }),
  };
});

describe("submit utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("estimateCreateProposalFee", () => {
    it("returns calculated fee in XLM", async () => {
      const fee = await estimateCreateProposalFee(
        "GBX...",
        "GBY...",
        "TOKEN...",
        100n,
        "Test proposal",
        1234567890n
      );

      // (100000 baseFee + 50000 minResourceFee) / 10000000 = 0.015
      expect(fee).toBe(0.015);
    });

    it("uses simulation result but does not broadcast transaction", async () => {
      const fee = await estimateCreateProposalFee(
        "GBX...",
        "GBY...",
        "TOKEN...",
        100n,
        "Test proposal",
        1234567890n
      );

      expect(fee).toBe(0.015);
      // Ensure we haven't tried to call anything related to signing or broadcasting
      // Note: we mocked sendTransaction to throw if called.
    });
  });
});
