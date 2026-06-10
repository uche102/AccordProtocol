#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token, Address, Env,
    IntoVal, String, Symbol, Val, Vec,
};

// ─── Data Types ─────────────────────────────────────────────────────────────

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub enum ProposalStatus {
    Pending,
    Ready,
    Executed,
    Expired,
    Revoked,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct Proposal {
    pub id: u64,
    pub proposer: Address,
    pub to: Address,
    pub amount: i128,
    pub token: Address,
    pub description: String,
    pub deadline: u64,
    pub approvals: u32,
    pub status: ProposalStatus,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct ProposalCreatedEvent {
    pub id: u64,
    pub proposer: Address,
    pub to: Address,
    pub amount: i128,
    pub threshold: u32,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct ProposalApprovedEvent {
    pub id: u64,
    pub approver: Address,
    pub approvals: u32,
    pub threshold: u32,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct ProposalRevokedEvent {
    pub id: u64,
    pub approver: Address,
    pub approvals: u32,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct ProposalExecutedEvent {
    pub id: u64,
    pub executor: Address,
    pub to: Address,
    pub amount: i128,
}

// ─── Errors ──────────────────────────────────────────────────────────────────

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[contracterror]
#[repr(u32)]
pub enum ContractError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    InvalidThreshold = 4,
    InvalidOwners = 5,
    ProposalNotFound = 6,
    ProposalNotActive = 7,
    AlreadyApproved = 8,
    NotApproved = 9,
    ThresholdNotMet = 10,
    ProposalExpired = 11,
    InvalidAmount = 12,
    InvalidDeadline = 13,
    InvalidToken = 14,
    TransferFailed = 15,
    EmptyDescription = 16,
    DescriptionTooLong = 17,
    TooManyActiveProposals = 18,
    DuplicateOwner = 19,
    ArithmeticError = 20,
    InvalidDuration = 21,
}

// ─── Storage Keys ────────────────────────────────────────────────────────────

fn init_key() -> Symbol {
    symbol_short!("INIT")
}

fn threshold_key() -> Symbol {
    symbol_short!("THRESH")
}

fn owners_key() -> Symbol {
    symbol_short!("OWNERS")
}

fn next_id_key() -> Symbol {
    symbol_short!("NEXT")
}

fn proposal_key(id: u64) -> (Symbol, u64) {
    (symbol_short!("PROP"), id)
}

fn approval_key(proposal_id: u64, owner: &Address) -> (Symbol, u64, Address) {
    (symbol_short!("APPR"), proposal_id, owner.clone())
}

fn active_count_key() -> Symbol {
    symbol_short!("ACTCNT")
}

// ─── TTL Constants ───────────────────────────────────────────────────────────

const INSTANCE_BUMP: u32 = 518_400; // ~30 days in ledgers
const INSTANCE_THRESHOLD: u32 = 17_280; // ~1 day

const PERSISTENT_BUMP: u32 = 518_400;
const PERSISTENT_THRESHOLD: u32 = 17_280;

fn bump_instance(env: &Env) {
    env.storage()
        .instance()
        .extend_ttl(INSTANCE_THRESHOLD, INSTANCE_BUMP);
}

fn bump_persistent<K: IntoVal<Env, Val>>(env: &Env, key: &K) {
    env.storage()
        .persistent()
        .extend_ttl(key, PERSISTENT_THRESHOLD, PERSISTENT_BUMP);
}

// ─── Validation Constants ────────────────────────────────────────────────────

/// Minimum amount: 0.1 stroops of whatever token is used.
const MIN_AMOUNT: i128 = 1;
/// Max description: 300 characters.
const MAX_DESCRIPTION_LEN: u32 = 300;
/// Maximum active (Pending + Ready) proposals at once to bound storage cost.
const MAX_ACTIVE_PROPOSALS: u32 = 50;
/// Maximum owners in a multisig wallet.
const MAX_OWNERS: u32 = 20;
/// Maximum proposal lifetime: 90 days.
const MAX_PROPOSAL_DURATION: u64 = 7_776_000;

// ─── Storage Helpers ─────────────────────────────────────────────────────────

fn is_initialized(env: &Env) -> bool {
    env.storage().instance().get::<_, bool>(&init_key()).unwrap_or(false)
}

fn read_threshold(env: &Env) -> Result<u32, ContractError> {
    env.storage()
        .instance()
        .get(&threshold_key())
        .ok_or(ContractError::NotInitialized)
}

fn read_owners(env: &Env) -> Result<Vec<Address>, ContractError> {
    let key = owners_key();
    let owners: Vec<Address> = env
        .storage()
        .persistent()
        .get(&key)
        .ok_or(ContractError::NotInitialized)?;
    bump_persistent(env, &key);
    Ok(owners)
}

fn read_next_id(env: &Env) -> u64 {
    let id = env.storage().instance().get(&next_id_key()).unwrap_or(1_u64);
    bump_instance(env);
    id
}

fn write_next_id(env: &Env, id: u64) {
    env.storage().instance().set(&next_id_key(), &id);
    bump_instance(env);
}

fn read_proposal(env: &Env, id: u64) -> Result<Proposal, ContractError> {
    let key = proposal_key(id);
    let proposal: Proposal = env
        .storage()
        .persistent()
        .get(&key)
        .ok_or(ContractError::ProposalNotFound)?;
    bump_persistent(env, &key);
    Ok(proposal)
}

fn write_proposal(env: &Env, proposal: &Proposal) {
    let key = proposal_key(proposal.id);
    env.storage().persistent().set(&key, proposal);
    bump_persistent(env, &key);
}

fn read_approval(env: &Env, proposal_id: u64, owner: &Address) -> bool {
    let key = approval_key(proposal_id, owner);
    let approved = env.storage().persistent().get(&key).unwrap_or(false);
    if env.storage().persistent().has(&key) {
        bump_persistent(env, &key);
    }
    approved
}

fn write_approval(env: &Env, proposal_id: u64, owner: &Address, approved: bool) {
    let key = approval_key(proposal_id, owner);
    env.storage().persistent().set(&key, &approved);
    bump_persistent(env, &key);
}

fn read_active_count(env: &Env) -> u32 {
    env.storage()
        .instance()
        .get(&active_count_key())
        .unwrap_or(0_u32)
}

fn write_active_count(env: &Env, count: u32) {
    env.storage().instance().set(&active_count_key(), &count);
    bump_instance(env);
}

// ─── Business Logic Helpers ──────────────────────────────────────────────────

fn require_owner(env: &Env, address: &Address) -> Result<(), ContractError> {
    let owners = read_owners(env)?;
    for owner in owners.iter() {
        if owner == *address {
            return Ok(());
        }
    }
    Err(ContractError::Unauthorized)
}

fn derive_status(env: &Env, proposal: &Proposal, threshold: u32) -> ProposalStatus {
    // Terminal statuses are never overridden.
    if matches!(
        proposal.status,
        ProposalStatus::Executed | ProposalStatus::Revoked
    ) {
        return proposal.status.clone();
    }
    let now = env.ledger().timestamp();
    if now > proposal.deadline {
        return ProposalStatus::Expired;
    }
    if proposal.approvals >= threshold {
        ProposalStatus::Ready
    } else {
        ProposalStatus::Pending
    }
}

fn validate_token(env: &Env, token_address: &Address) -> Result<(), ContractError> {
    let client = token::Client::new(env, token_address);
    if client.try_decimals().is_err() || client.try_symbol().is_err() {
        return Err(ContractError::InvalidToken);
    }
    Ok(())
}

// ─── Contract ────────────────────────────────────────────────────────────────

#[contract]
pub struct AccordContract;

#[contractimpl]
impl AccordContract {
    /// One-shot initializer. Sets the list of owners and the approval threshold.
    ///
    /// # Arguments
    /// * `owners` - Non-empty list of unique owner addresses (max 20).
    /// * `threshold` - Number of approvals required to execute a proposal (1 ≤ threshold ≤ owners.len()).
    pub fn initialize(
        env: Env,
        owners: Vec<Address>,
        threshold: u32,
    ) -> Result<(), ContractError> {
        if is_initialized(&env) {
            return Err(ContractError::AlreadyInitialized);
        }

        let n = owners.len();
        if n == 0 || n > MAX_OWNERS {
            return Err(ContractError::InvalidOwners);
        }
        if threshold == 0 || threshold > n {
            return Err(ContractError::InvalidThreshold);
        }

        // Reject duplicate addresses before requiring auth (duplicate require_auth aborts host).
        for i in 0..owners.len() {
            for j in (i + 1)..owners.len() {
                if owners.get(i).unwrap() == owners.get(j).unwrap() {
                    return Err(ContractError::DuplicateOwner);
                }
            }
        }

        // Require auth from all owners — they must all consent to being part of this multisig.
        for owner in owners.iter() {
            owner.require_auth();
        }

        let key = owners_key();
        env.storage().persistent().set(&key, &owners);
        bump_persistent(&env, &key);

        env.storage().instance().set(&threshold_key(), &threshold);
        env.storage().instance().set(&init_key(), &true);
        bump_instance(&env);

        Ok(())
    }

    /// Creates a new transfer proposal.
    ///
    /// # Arguments
    /// * `proposer` - Owner proposing the transfer. Must authorize.
    /// * `to` - Recipient address.
    /// * `amount` - Amount in the token's smallest unit. Must be > 0.
    /// * `token` - Token contract address implementing the Soroban token interface.
    /// * `description` - Human-readable description (max 300 chars).
    /// * `deadline` - Unix timestamp after which the proposal expires.
    pub fn create_proposal(
        env: Env,
        proposer: Address,
        to: Address,
        amount: i128,
        token: Address,
        description: String,
        deadline: u64,
    ) -> Result<u64, ContractError> {
        proposer.require_auth();
        require_owner(&env, &proposer)?;

        if amount < MIN_AMOUNT {
            return Err(ContractError::InvalidAmount);
        }
        if description.is_empty() {
            return Err(ContractError::EmptyDescription);
        }
        if description.len() > MAX_DESCRIPTION_LEN {
            return Err(ContractError::DescriptionTooLong);
        }

        let now = env.ledger().timestamp();
        if deadline <= now {
            return Err(ContractError::InvalidDeadline);
        }
        if deadline - now > MAX_PROPOSAL_DURATION {
            return Err(ContractError::InvalidDuration);
        }

        validate_token(&env, &token)?;

        let active = read_active_count(&env);
        if active >= MAX_ACTIVE_PROPOSALS {
            return Err(ContractError::TooManyActiveProposals);
        }

        let threshold = read_threshold(&env)?;
        let id = read_next_id(&env);
        let next_id = id.checked_add(1).ok_or(ContractError::ArithmeticError)?;
        write_next_id(&env, next_id);

        let proposal = Proposal {
            id,
            proposer: proposer.clone(),
            to: to.clone(),
            amount,
            token: token.clone(),
            description,
            deadline,
            approvals: 0,
            status: ProposalStatus::Pending,
        };
        write_proposal(&env, &proposal);
        write_active_count(&env, active + 1);

        env.events().publish(
            (symbol_short!("created"),),
            ProposalCreatedEvent {
                id,
                proposer,
                to,
                amount,
                threshold,
            },
        );

        Ok(id)
    }

    /// Approves a proposal. The approver must be an owner and must not have already approved.
    ///
    /// Automatically transitions the proposal to `Ready` when the approval count reaches threshold.
    pub fn approve(
        env: Env,
        approver: Address,
        proposal_id: u64,
    ) -> Result<(), ContractError> {
        approver.require_auth();
        require_owner(&env, &approver)?;

        let threshold = read_threshold(&env)?;
        let mut proposal = read_proposal(&env, proposal_id)?;

        // Refresh derived status so an already-expired proposal is caught here.
        proposal.status = derive_status(&env, &proposal, threshold);

        if !matches!(
            proposal.status,
            ProposalStatus::Pending | ProposalStatus::Ready
        ) {
            return Err(ContractError::ProposalNotActive);
        }

        if read_approval(&env, proposal_id, &approver) {
            return Err(ContractError::AlreadyApproved);
        }

        write_approval(&env, proposal_id, &approver, true);

        proposal.approvals = proposal
            .approvals
            .checked_add(1)
            .ok_or(ContractError::ArithmeticError)?;
        proposal.status = derive_status(&env, &proposal, threshold);
        write_proposal(&env, &proposal);

        env.events().publish(
            (symbol_short!("approved"),),
            ProposalApprovedEvent {
                id: proposal_id,
                approver,
                approvals: proposal.approvals,
                threshold,
            },
        );

        Ok(())
    }

    /// Revokes the caller's approval from a proposal that has not yet been executed.
    ///
    /// The proposal status is recalculated after the revoke: if approvals fall below
    /// threshold the status transitions back to `Pending`.
    pub fn revoke(
        env: Env,
        approver: Address,
        proposal_id: u64,
    ) -> Result<(), ContractError> {
        approver.require_auth();
        require_owner(&env, &approver)?;

        let threshold = read_threshold(&env)?;
        let mut proposal = read_proposal(&env, proposal_id)?;

        proposal.status = derive_status(&env, &proposal, threshold);

        if !matches!(
            proposal.status,
            ProposalStatus::Pending | ProposalStatus::Ready
        ) {
            return Err(ContractError::ProposalNotActive);
        }

        if !read_approval(&env, proposal_id, &approver) {
            return Err(ContractError::NotApproved);
        }

        write_approval(&env, proposal_id, &approver, false);

        proposal.approvals = proposal
            .approvals
            .checked_sub(1)
            .ok_or(ContractError::ArithmeticError)?;
        proposal.status = derive_status(&env, &proposal, threshold);
        write_proposal(&env, &proposal);

        env.events().publish(
            (symbol_short!("revoked"),),
            ProposalRevokedEvent {
                id: proposal_id,
                approver,
                approvals: proposal.approvals,
            },
        );

        Ok(())
    }

    /// Executes a `Ready` proposal by transferring tokens from the multisig contract
    /// to the proposal's recipient address. Only owners may execute.
    ///
    /// The contract must hold at least `proposal.amount` of the proposal token
    /// before this is called (funded by owners depositing tokens externally).
    pub fn execute(
        env: Env,
        executor: Address,
        proposal_id: u64,
    ) -> Result<(), ContractError> {
        executor.require_auth();
        require_owner(&env, &executor)?;

        let threshold = read_threshold(&env)?;
        let mut proposal = read_proposal(&env, proposal_id)?;

        proposal.status = derive_status(&env, &proposal, threshold);

        if matches!(proposal.status, ProposalStatus::Expired) {
            // Persist the expired status and free up the active slot.
            write_proposal(&env, &proposal);
            let active = read_active_count(&env);
            if active > 0 {
                write_active_count(&env, active - 1);
            }
            return Err(ContractError::ProposalExpired);
        }

        if !matches!(proposal.status, ProposalStatus::Ready) {
            if proposal.approvals < threshold {
                return Err(ContractError::ThresholdNotMet);
            }
            return Err(ContractError::ProposalNotActive);
        }

        // Transfer tokens from this contract to the recipient.
        if token::Client::new(&env, &proposal.token)
            .try_transfer(
                &env.current_contract_address(),
                &proposal.to,
                &proposal.amount,
            )
            .is_err()
        {
            return Err(ContractError::TransferFailed);
        }

        proposal.status = ProposalStatus::Executed;
        write_proposal(&env, &proposal);

        let active = read_active_count(&env);
        if active > 0 {
            write_active_count(&env, active - 1);
        }

        env.events().publish(
            (symbol_short!("executed"),),
            ProposalExecutedEvent {
                id: proposal_id,
                executor,
                to: proposal.to.clone(),
                amount: proposal.amount,
            },
        );

        Ok(())
    }

    // ─── Read-Only Queries ───────────────────────────────────────────────────

    /// Returns the current state of a proposal with a derived status.
    pub fn get_proposal(env: Env, proposal_id: u64) -> Result<Proposal, ContractError> {
        let threshold = read_threshold(&env)?;
        let mut proposal = read_proposal(&env, proposal_id)?;
        proposal.status = derive_status(&env, &proposal, threshold);
        Ok(proposal)
    }

    /// Returns a page of proposals. `offset` is a 0-based index; `limit` is capped at 20.
    pub fn get_proposals_paged(env: Env, offset: u64, mut limit: u32) -> Vec<Proposal> {
        if limit > 20 {
            limit = 20;
        }
        let next_id = read_next_id(&env);
        let threshold = env
            .storage()
            .instance()
            .get(&threshold_key())
            .unwrap_or(1_u32);

        let mut result = Vec::new(&env);
        let start = offset + 1;
        let end = (offset + u64::from(limit)).min(next_id.saturating_sub(1));

        for id in start..=end {
            if let Ok(mut proposal) = read_proposal(&env, id) {
                proposal.status = derive_status(&env, &proposal, threshold);
                result.push_back(proposal);
            }
        }
        result
    }

    /// Returns all current owners.
    pub fn get_owners(env: Env) -> Result<Vec<Address>, ContractError> {
        read_owners(&env)
    }

    /// Returns the current approval threshold.
    pub fn get_threshold(env: Env) -> Result<u32, ContractError> {
        read_threshold(&env)
    }

    /// Returns the total number of proposals ever created.
    pub fn get_total_proposals(env: Env) -> u64 {
        read_next_id(&env).saturating_sub(1)
    }

    /// Returns whether `address` is a current owner.
    pub fn is_owner(env: Env, address: Address) -> bool {
        require_owner(&env, &address).is_ok()
    }

    /// Returns whether `owner` has approved `proposal_id`.
    pub fn has_approved(env: Env, proposal_id: u64, owner: Address) -> bool {
        read_approval(&env, proposal_id, &owner)
    }
}

mod test;
