#![cfg(test)]

extern crate std;

use super::*;
use soroban_sdk::testutils::{Address as _, Events, Ledger as _};
use soroban_sdk::{token, Address, Env, String, Vec};

// ─── Helpers ─────────────────────────────────────────────────────────────────

fn set_timestamp(env: &Env, ts: u64) {
    let mut l = env.ledger().get();
    l.timestamp = ts;
    env.ledger().set(l);
}

fn str(env: &Env, s: &str) -> String {
    String::from_str(env, s)
}

const NOW: u64 = 1_000;
const DEADLINE: u64 = NOW + 86_400; // +1 day

/// Sets up an env with 3 owners, a threshold, and a funded token.
fn setup(
    threshold: u32,
) -> (
    Env,
    AccordContractClient<'static>,
    Address,
    Address,
    Address,
    Address, // non-owner
    token::Client<'static>,
) {
    let env = Env::default();
    env.mock_all_auths();
    set_timestamp(&env, NOW);

    let owner_a = Address::generate(&env);
    let owner_b = Address::generate(&env);
    let owner_c = Address::generate(&env);
    let non_owner = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let token_id = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_client = token::Client::new(&env, &token_id.address());
    let token_sac = token::StellarAssetClient::new(&env, &token_id.address());

    let contract_id = env.register(AccordContract, ());
    let client = AccordContractClient::new(&env, &contract_id);

    let mut owners = Vec::new(&env);
    owners.push_back(owner_a.clone());
    owners.push_back(owner_b.clone());
    owners.push_back(owner_c.clone());
    client.initialize(&owners, &threshold);

    // Fund the multisig contract so it can pay out proposals.
    token_sac.mint(&contract_id, &1_000_000_000_000_i128);

    (env, client, owner_a, owner_b, owner_c, non_owner, token_client)
}

// ─── Initialization ──────────────────────────────────────────────────────────

#[test]
fn initialize_sets_owners_and_threshold() {
    let (_, client, owner_a, owner_b, owner_c, _, _) = setup(2);
    let owners = client.get_owners();
    assert_eq!(owners.len(), 3);
    assert!(owners.contains(&owner_a));
    assert!(owners.contains(&owner_b));
    assert!(owners.contains(&owner_c));
    assert_eq!(client.get_threshold(), 2);
}

#[test]
fn initialize_rejects_second_call() {
    let (env, client, owner_a, owner_b, owner_c, _, _) = setup(2);
    let mut owners = Vec::new(&env);
    owners.push_back(owner_a);
    owners.push_back(owner_b);
    owners.push_back(owner_c);
    assert_eq!(
        client.try_initialize(&owners, &2),
        Err(Ok(ContractError::AlreadyInitialized))
    );
}

#[test]
fn initialize_rejects_threshold_zero() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(AccordContract, ());
    let client = AccordContractClient::new(&env, &contract_id);
    let mut owners = Vec::new(&env);
    owners.push_back(Address::generate(&env));
    assert_eq!(
        client.try_initialize(&owners, &0),
        Err(Ok(ContractError::InvalidThreshold))
    );
}

#[test]
fn initialize_rejects_threshold_above_count() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(AccordContract, ());
    let client = AccordContractClient::new(&env, &contract_id);
    let mut owners = Vec::new(&env);
    owners.push_back(Address::generate(&env));
    assert_eq!(
        client.try_initialize(&owners, &2),
        Err(Ok(ContractError::InvalidThreshold))
    );
}

#[test]
fn initialize_rejects_duplicate_owners() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(AccordContract, ());
    let client = AccordContractClient::new(&env, &contract_id);
    let dup = Address::generate(&env);
    let mut owners = Vec::new(&env);
    owners.push_back(dup.clone());
    owners.push_back(dup);
    assert_eq!(
        client.try_initialize(&owners, &1),
        Err(Ok(ContractError::DuplicateOwner))
    );
}

// ─── Proposal Creation ───────────────────────────────────────────────────────

#[test]
fn create_proposal_returns_sequential_ids() {
    let (env, client, owner_a, _, _, _, token_client) = setup(2);
    let id1 = client.create_proposal(
        &owner_a,
        &Address::generate(&env),
        &1_000_000_i128,
        &token_client.address,
        &str(&env, "First"),
        &DEADLINE,
    );
    let id2 = client.create_proposal(
        &owner_a,
        &Address::generate(&env),
        &2_000_000_i128,
        &token_client.address,
        &str(&env, "Second"),
        &DEADLINE,
    );
    assert_eq!(id1, 1);
    assert_eq!(id2, 2);
    assert_eq!(client.get_total_proposals(), 2);
}

#[test]
fn create_proposal_rejects_non_owner() {
    let (env, client, _, _, _, non_owner, token_client) = setup(2);
    assert_eq!(
        client.try_create_proposal(
            &non_owner,
            &Address::generate(&env),
            &1_000_000_i128,
            &token_client.address,
            &str(&env, "Unauthorized"),
            &DEADLINE,
        ),
        Err(Ok(ContractError::Unauthorized))
    );
}

#[test]
fn create_proposal_rejects_zero_amount() {
    let (env, client, owner_a, _, _, _, token_client) = setup(2);
    assert_eq!(
        client.try_create_proposal(
            &owner_a,
            &Address::generate(&env),
            &0_i128,
            &token_client.address,
            &str(&env, "Zero"),
            &DEADLINE,
        ),
        Err(Ok(ContractError::InvalidAmount))
    );
}

#[test]
fn create_proposal_rejects_past_deadline() {
    let (env, client, owner_a, _, _, _, token_client) = setup(2);
    assert_eq!(
        client.try_create_proposal(
            &owner_a,
            &Address::generate(&env),
            &1_000_000_i128,
            &token_client.address,
            &str(&env, "Stale"),
            &(NOW - 1),
        ),
        Err(Ok(ContractError::InvalidDeadline))
    );
}

#[test]
fn create_proposal_rejects_empty_description() {
    let (env, client, owner_a, _, _, _, token_client) = setup(2);
    assert_eq!(
        client.try_create_proposal(
            &owner_a,
            &Address::generate(&env),
            &1_000_000_i128,
            &token_client.address,
            &str(&env, ""),
            &DEADLINE,
        ),
        Err(Ok(ContractError::EmptyDescription))
    );
}

#[test]
fn create_proposal_emits_created_event() {
    let (env, client, owner_a, _, _, _, token_client) = setup(2);
    let recipient = Address::generate(&env);
    let amount: i128 = 5_000_000;
    let _id = client.create_proposal(
        &owner_a,
        &recipient,
        &amount,
        &token_client.address,
        &str(&env, "Grant"),
        &DEADLINE,
    );

    // Verify at least one event was emitted by this contract.
    let contract_events = env.events().all().filter_by_contract(&client.address);
    assert!(
        !contract_events.events().is_empty(),
        "expected a 'created' event to be emitted"
    );
}

// ─── Approve ─────────────────────────────────────────────────────────────────

#[test]
fn approve_increments_count_and_sets_flag() {
    let (env, client, owner_a, owner_b, _, _, token_client) = setup(3);
    let id = client.create_proposal(
        &owner_a,
        &Address::generate(&env),
        &1_000_000_i128,
        &token_client.address,
        &str(&env, "Pay"),
        &DEADLINE,
    );
    client.approve(&owner_a, &id);
    assert_eq!(client.get_proposal(&id).approvals, 1);
    assert!(client.has_approved(&id, &owner_a));
    client.approve(&owner_b, &id);
    assert_eq!(client.get_proposal(&id).approvals, 2);
}

#[test]
fn approve_transitions_pending_to_ready() {
    let (env, client, owner_a, owner_b, _, _, token_client) = setup(2);
    let id = client.create_proposal(
        &owner_a,
        &Address::generate(&env),
        &1_000_000_i128,
        &token_client.address,
        &str(&env, "Pay"),
        &DEADLINE,
    );
    client.approve(&owner_a, &id);
    assert_eq!(
        client.get_proposal(&id).status,
        ProposalStatus::Pending
    );
    client.approve(&owner_b, &id);
    assert_eq!(
        client.get_proposal(&id).status,
        ProposalStatus::Ready
    );
}

#[test]
fn approve_rejects_double_approve() {
    let (env, client, owner_a, _, _, _, token_client) = setup(2);
    let id = client.create_proposal(
        &owner_a,
        &Address::generate(&env),
        &1_000_000_i128,
        &token_client.address,
        &str(&env, "Pay"),
        &DEADLINE,
    );
    client.approve(&owner_a, &id);
    assert_eq!(
        client.try_approve(&owner_a, &id),
        Err(Ok(ContractError::AlreadyApproved))
    );
}

#[test]
fn approve_rejects_non_owner() {
    let (env, client, owner_a, _, _, non_owner, token_client) = setup(2);
    let id = client.create_proposal(
        &owner_a,
        &Address::generate(&env),
        &1_000_000_i128,
        &token_client.address,
        &str(&env, "Pay"),
        &DEADLINE,
    );
    assert_eq!(
        client.try_approve(&non_owner, &id),
        Err(Ok(ContractError::Unauthorized))
    );
}

// ─── Revoke ──────────────────────────────────────────────────────────────────

#[test]
fn revoke_decrements_count_and_clears_flag() {
    let (env, client, owner_a, _, _, _, token_client) = setup(2);
    let id = client.create_proposal(
        &owner_a,
        &Address::generate(&env),
        &1_000_000_i128,
        &token_client.address,
        &str(&env, "Pay"),
        &DEADLINE,
    );
    client.approve(&owner_a, &id);
    client.revoke(&owner_a, &id);
    assert_eq!(client.get_proposal(&id).approvals, 0);
    assert!(!client.has_approved(&id, &owner_a));
}

#[test]
fn revoke_transitions_ready_back_to_pending() {
    let (env, client, owner_a, owner_b, _, _, token_client) = setup(2);
    let id = client.create_proposal(
        &owner_a,
        &Address::generate(&env),
        &1_000_000_i128,
        &token_client.address,
        &str(&env, "Pay"),
        &DEADLINE,
    );
    client.approve(&owner_a, &id);
    client.approve(&owner_b, &id);
    assert_eq!(
        client.get_proposal(&id).status,
        ProposalStatus::Ready
    );
    client.revoke(&owner_a, &id);
    assert_eq!(
        client.get_proposal(&id).status,
        ProposalStatus::Pending
    );
}

#[test]
fn revoke_rejects_when_not_previously_approved() {
    let (env, client, owner_a, _, _, _, token_client) = setup(2);
    let id = client.create_proposal(
        &owner_a,
        &Address::generate(&env),
        &1_000_000_i128,
        &token_client.address,
        &str(&env, "Pay"),
        &DEADLINE,
    );
    assert_eq!(
        client.try_revoke(&owner_a, &id),
        Err(Ok(ContractError::NotApproved))
    );
}

// ─── Execute ─────────────────────────────────────────────────────────────────

#[test]
fn execute_transfers_tokens_to_recipient() {
    let (env, client, owner_a, owner_b, owner_c, _, token_client) = setup(2);
    let recipient = Address::generate(&env);
    let amount: i128 = 50_000_000;
    let id = client.create_proposal(
        &owner_a,
        &recipient,
        &amount,
        &token_client.address,
        &str(&env, "Bonus"),
        &DEADLINE,
    );
    client.approve(&owner_a, &id);
    client.approve(&owner_b, &id);
    let before = token_client.balance(&recipient);
    client.execute(&owner_c, &id);
    assert_eq!(token_client.balance(&recipient) - before, amount);
    assert_eq!(
        client.get_proposal(&id).status,
        ProposalStatus::Executed
    );
}

#[test]
fn execute_rejects_when_threshold_not_met() {
    let (env, client, owner_a, _, _, _, token_client) = setup(2);
    let id = client.create_proposal(
        &owner_a,
        &Address::generate(&env),
        &1_000_000_i128,
        &token_client.address,
        &str(&env, "Short"),
        &DEADLINE,
    );
    client.approve(&owner_a, &id); // only 1 of 2
    assert_eq!(
        client.try_execute(&owner_a, &id),
        Err(Ok(ContractError::ThresholdNotMet))
    );
}

#[test]
fn execute_rejects_non_owner() {
    let (env, client, owner_a, owner_b, _, non_owner, token_client) = setup(2);
    let id = client.create_proposal(
        &owner_a,
        &Address::generate(&env),
        &1_000_000_i128,
        &token_client.address,
        &str(&env, "Pay"),
        &DEADLINE,
    );
    client.approve(&owner_a, &id);
    client.approve(&owner_b, &id);
    assert_eq!(
        client.try_execute(&non_owner, &id),
        Err(Ok(ContractError::Unauthorized))
    );
}

#[test]
fn execute_rejects_already_executed() {
    let (env, client, owner_a, owner_b, owner_c, _, token_client) = setup(2);
    let id = client.create_proposal(
        &owner_a,
        &Address::generate(&env),
        &1_000_000_i128,
        &token_client.address,
        &str(&env, "Pay"),
        &DEADLINE,
    );
    client.approve(&owner_a, &id);
    client.approve(&owner_b, &id);
    client.execute(&owner_c, &id);
    assert_eq!(
        client.try_execute(&owner_a, &id),
        Err(Ok(ContractError::ProposalNotActive))
    );
}

#[test]
fn execute_emits_executed_event() {
    let (env, client, owner_a, owner_b, _, _, token_client) = setup(2);
    let recipient = Address::generate(&env);
    let amount: i128 = 10_000_000;
    let id = client.create_proposal(
        &owner_a,
        &recipient,
        &amount,
        &token_client.address,
        &str(&env, "Event"),
        &DEADLINE,
    );
    client.approve(&owner_a, &id);
    client.approve(&owner_b, &id);
    client.execute(&owner_a, &id);

    // env.events().all() returns events from the last call; verify execute emitted at least one.
    let contract_events = env.events().all().filter_by_contract(&client.address);
    assert!(
        !contract_events.events().is_empty(),
        "expected an 'executed' event to be emitted"
    );
}

// ─── Expiry ──────────────────────────────────────────────────────────────────

#[test]
fn proposal_shows_expired_after_deadline() {
    let (env, client, owner_a, _, _, _, token_client) = setup(2);
    let deadline = NOW + 3_600;
    let id = client.create_proposal(
        &owner_a,
        &Address::generate(&env),
        &1_000_000_i128,
        &token_client.address,
        &str(&env, "Short window"),
        &deadline,
    );
    set_timestamp(&env, deadline + 1);
    assert_eq!(
        client.get_proposal(&id).status,
        ProposalStatus::Expired
    );
}

#[test]
fn approve_rejects_expired_proposal() {
    let (env, client, owner_a, owner_b, _, _, token_client) = setup(2);
    let deadline = NOW + 3_600;
    let id = client.create_proposal(
        &owner_a,
        &Address::generate(&env),
        &1_000_000_i128,
        &token_client.address,
        &str(&env, "Expiring"),
        &deadline,
    );
    set_timestamp(&env, deadline + 1);
    assert_eq!(
        client.try_approve(&owner_b, &id),
        Err(Ok(ContractError::ProposalNotActive))
    );
}

#[test]
fn execute_rejects_expired_even_if_approved() {
    let (env, client, owner_a, owner_b, _, _, token_client) = setup(2);
    let deadline = NOW + 3_600;
    let id = client.create_proposal(
        &owner_a,
        &Address::generate(&env),
        &1_000_000_i128,
        &token_client.address,
        &str(&env, "Approved but expired"),
        &deadline,
    );
    client.approve(&owner_a, &id);
    client.approve(&owner_b, &id);
    set_timestamp(&env, deadline + 1);
    assert_eq!(
        client.try_execute(&owner_a, &id),
        Err(Ok(ContractError::ProposalExpired))
    );
}

// ─── Query ───────────────────────────────────────────────────────────────────

#[test]
fn is_owner_returns_correct_results() {
    let (_, client, owner_a, _, _, non_owner, _) = setup(2);
    assert!(client.is_owner(&owner_a));
    assert!(!client.is_owner(&non_owner));
}

#[test]
fn get_proposals_paged_returns_correct_window() {
    let (env, client, owner_a, _, _, _, token_client) = setup(2);
    for _ in 0..5_u32 {
        client.create_proposal(
            &owner_a,
            &Address::generate(&env),
            &1_000_000_i128,
            &token_client.address,
            &str(&env, "Batch"),
            &DEADLINE,
        );
    }
    let page1 = client.get_proposals_paged(&0, &3);
    assert_eq!(page1.len(), 3);
    assert_eq!(page1.get(0).unwrap().id, 1);
    let page2 = client.get_proposals_paged(&3, &3);
    assert_eq!(page2.len(), 2);
    assert_eq!(page2.get(0).unwrap().id, 4);
}

// ─── Full Lifecycle ───────────────────────────────────────────────────────────

#[test]
fn full_lifecycle_2of3() {
    let (env, client, owner_a, owner_b, owner_c, _, token_client) = setup(2);
    let recipient = Address::generate(&env);
    let amount: i128 = 100_000_000;

    let id = client.create_proposal(
        &owner_a,
        &recipient,
        &amount,
        &token_client.address,
        &str(&env, "Full lifecycle"),
        &DEADLINE,
    );
    assert_eq!(
        client.get_proposal(&id).status,
        ProposalStatus::Pending
    );

    client.approve(&owner_a, &id);
    assert_eq!(
        client.get_proposal(&id).status,
        ProposalStatus::Pending
    );

    client.approve(&owner_b, &id);
    assert_eq!(
        client.get_proposal(&id).status,
        ProposalStatus::Ready
    );

    let before = token_client.balance(&recipient);
    client.execute(&owner_c, &id);
    assert_eq!(token_client.balance(&recipient) - before, amount);
    assert_eq!(
        client.get_proposal(&id).status,
        ProposalStatus::Executed
    );
}
