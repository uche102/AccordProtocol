import { render, screen, fireEvent } from "@testing-library/react";
import { CreateProposalModal } from "./CreateProposalModal";
import { StrKey } from "@stellar/stellar-sdk";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateProposalModal } from "./CreateProposalModal";
import { estimateCreateProposalFee, createProposal } from "../lib/submit";

// Mock the submit logic
jest.mock("../lib/submit", () => ({
  createProposal: jest.fn(),
}));

describe("CreateProposalModal", () => {
  const defaultProps = {
    walletAddress: "GBX...MOCK",
  estimateCreateProposalFee: jest.fn(),
}));

describe("CreateProposalModal Fee Estimation", () => {
  const defaultProps = {
    walletAddress: "GBX...MOCK",
import { render, screen } from "@testing-library/react";
import { CreateProposalModal } from "./CreateProposalModal";

describe("CreateProposalModal - Proposer Field", () => {
  const defaultProps = {
    walletAddress: "GBXGJZUFVB2F3J2Y5B4S4V6JWYD2H4O3T7XQZT5XKV6S2J5N6Z2Z2Z2Z",
    onClose: jest.fn(),
    onSubmitted: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Empty untouched field does not show validation message", () => {
    render(<CreateProposalModal {...defaultProps} />);
    expect(screen.queryByText("Enter a valid Stellar address")).not.toBeInTheDocument();
  });

  it("Typing random text triggers touched state and shows validation error", () => {
    render(<CreateProposalModal {...defaultProps} />);
    const input = screen.getByPlaceholderText("G...");
    
    fireEvent.change(input, { target: { value: "abc123" } });
    
    // Typing triggers touched state, and since abc123 is invalid, it shows error
    expect(screen.getByText("Enter a valid Stellar address")).toBeInTheDocument();
  });

  it("Random text shows validation error after blur", () => {
    render(<CreateProposalModal {...defaultProps} />);
    const input = screen.getByPlaceholderText("G...");
    
    // Just blur without changing to see if touched state triggers
    // However, if it's empty, StrKey validation returns false, so it will show error
    fireEvent.blur(input);
    expect(screen.getByText("Enter a valid Stellar address")).toBeInTheDocument();
  });

  it("Valid Stellar address clears error", () => {
    render(<CreateProposalModal {...defaultProps} />);
    const input = screen.getByPlaceholderText("G...");
    
    // Type an invalid address
    fireEvent.change(input, { target: { value: "abc123" } });
    expect(screen.getByText("Enter a valid Stellar address")).toBeInTheDocument();
    
    // Type a valid address
    // Valid Ed25519 public key
    const validAddress = "GBXGJZUFVB2F3J2Y5B4S4V6JWYD2H4O3T7XQZT5XKV6S2J5N6Z2Z2Z2Z"; 
    fireEvent.change(input, { target: { value: validAddress } });
    
    // Mock valid check if not strictly matching above due to checksums (assuming real SDK validates it)
    expect(screen.queryByText("Enter a valid Stellar address")).not.toBeInTheDocument();
  });

  it("Invalid address blocks submit", () => {
    render(<CreateProposalModal {...defaultProps} />);
    const input = screen.getByPlaceholderText("G...");
    const submitBtn = screen.getByText("Submit Proposal");

    // Fill in other required fields so only recipient is invalid
    fireEvent.change(screen.getByPlaceholderText("0.00"), { target: { value: "10" } });
    fireEvent.change(screen.getByPlaceholderText("What is this payment for?"), { target: { value: "Test" } });
    
    fireEvent.change(input, { target: { value: "invalid-address" } });
    fireEvent.click(submitBtn);

    // Error from submit handler should appear
    expect(screen.getAllByText("Enter a valid Stellar address").length).toBeGreaterThan(0);
    
    // The submit action should not proceed
    expect(defaultProps.onClose).not.toHaveBeenCalled();
    expect(defaultProps.onSubmitted).not.toHaveBeenCalled();
  const fillRequiredFields = () => {
    fireEvent.change(screen.getByPlaceholderText("G..."), { target: { value: "GBY...MOCK" } });
    fireEvent.change(screen.getByPlaceholderText("0.00"), { target: { value: "10" } });
    fireEvent.change(screen.getByPlaceholderText("What is this payment for?"), { target: { value: "Test payment" } });
  };

  it("Calculate fee button hidden when wallet disconnected", () => {
    render(<CreateProposalModal {...defaultProps} walletAddress={null} />);
    fillRequiredFields();
    expect(screen.queryByText("Calculate fee")).not.toBeInTheDocument();
  });

  it("Calculate fee hidden when required fields are empty", () => {
    render(<CreateProposalModal {...defaultProps} />);
    // Just amount filled, others empty
    fireEvent.change(screen.getByPlaceholderText("0.00"), { target: { value: "10" } });
    expect(screen.queryByText("Calculate fee")).not.toBeInTheDocument();
  });

  it("Button appears when all required fields are present", () => {
    render(<CreateProposalModal {...defaultProps} />);
    fillRequiredFields();
    expect(screen.getByText("Calculate fee")).toBeInTheDocument();
  });

  it("Clicking button shows 'Estimating fee…' and successful simulation displays estimated XLM fee", async () => {
    (estimateCreateProposalFee as jest.Mock).mockResolvedValue(0.012345);

    render(<CreateProposalModal {...defaultProps} />);
    fillRequiredFields();

    const calcBtn = screen.getByText("Calculate fee");
    fireEvent.click(calcBtn);

    expect(screen.getByText("Estimating fee…")).toBeInTheDocument();

    await waitFor(() => {
      // Fee formats to 7 decimal places.
      expect(screen.getByText(/0\.0123450 XLM/)).toBeInTheDocument();
      expect(screen.queryByText("Estimating fee…")).not.toBeInTheDocument();
    });
  });

  it("Simulation failure shows 'Could not estimate fee' and Submission still works after estimation failure", async () => {
    (estimateCreateProposalFee as jest.Mock).mockRejectedValue(new Error("Sim Failed"));
    (createProposal as jest.Mock).mockResolvedValue(undefined);

    render(<CreateProposalModal {...defaultProps} />);
    fillRequiredFields();

    const calcBtn = screen.getByText("Calculate fee");
    fireEvent.click(calcBtn);

    await waitFor(() => {
      expect(screen.getByText("Could not estimate fee")).toBeInTheDocument();
    });

    const submitBtn = screen.getByText("Submit Proposal");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(createProposal).toHaveBeenCalled();
      expect(defaultProps.onSubmitted).toHaveBeenCalled();
    });
  it("Connected wallet opens modal and shows Proposer field", () => {
    render(<CreateProposalModal {...defaultProps} />);
    expect(screen.getByText("Proposer")).toBeInTheDocument();
  });

  it("Address is truncated to first 6 and last 4", () => {
    render(<CreateProposalModal {...defaultProps} />);
    // "GBXGJZ" ... "Z2Z2"
    expect(screen.getByText("GBXGJZ…Z2Z2")).toBeInTheDocument();
  });

  it("Proposer cannot be edited (renders as read-only element, not input)", () => {
    render(<CreateProposalModal {...defaultProps} />);
    // The "Proposer" label is followed by a div, not an input.
    // Testing library's getByLabelText will fail if it's not an input.
    expect(() => screen.getByLabelText("Proposer")).toThrow();
  });

  it("No wallet connected displays 'Not connected'", () => {
    render(<CreateProposalModal {...defaultProps} walletAddress={null} />);
    expect(screen.getByText("Not connected")).toBeInTheDocument();
  });
});
