#![cfg(test)]

use super::{MysteryExchange, MysteryExchangeClient};
use soroban_sdk::{testutils::Address as _, testutils::Ledger, Address, Env, String, Vec};

fn setup() -> (Env, MysteryExchangeClient<'static>, Address, u64) {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(MysteryExchange, ());
    let client = MysteryExchangeClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let unlock_timestamp = env.ledger().timestamp() + 1_000;
    client.initialize(&admin, &unlock_timestamp);

    (env, client, admin, unlock_timestamp)
}

fn register_n(env: &Env, client: &MysteryExchangeClient, n: u32) -> Vec<Address> {
    let mut owners = Vec::new(env);
    for _ in 0..n {
        let owner = Address::generate(env);
        let token_contract = Address::generate(env);
        client.register(
            &owner,
            &token_contract,
            &String::from_str(env, "Token de Prueba"),
            &String::from_str(env, "TST"),
            &String::from_str(env, "🎁"),
            &String::from_str(env, "Un regalo de prueba"),
        );
        owners.push_back(owner);
    }
    owners
}

#[test]
fn test_register_agrega_participante() {
    let (env, client, _admin, _unlock) = setup();
    register_n(&env, &client, 1);
    assert_eq!(client.list().len(), 1);
}

#[test]
#[should_panic(expected = "ya te registraste en el sorteo")]
fn test_register_falla_duplicado() {
    let (env, client, _admin, _unlock) = setup();
    let owner = Address::generate(&env);
    let token_contract = Address::generate(&env);

    client.register(
        &owner,
        &token_contract,
        &String::from_str(&env, "Token de Prueba"),
        &String::from_str(&env, "TST"),
        &String::from_str(&env, "🎁"),
        &String::from_str(&env, "Un regalo de prueba"),
    );
    client.register(
        &owner,
        &token_contract,
        &String::from_str(&env, "Token de Prueba"),
        &String::from_str(&env, "TST"),
        &String::from_str(&env, "🎁"),
        &String::from_str(&env, "Un regalo de prueba"),
    );
}

#[test]
#[should_panic(expected = "hacen falta al menos 2 participantes para sortear")]
fn test_shuffle_falla_con_menos_de_dos() {
    let (env, client, admin, _unlock) = setup();
    register_n(&env, &client, 1);
    client.shuffle(&admin);
}

#[test]
fn test_shuffle_nadie_se_autoasigna() {
    let (env, client, admin, _unlock) = setup();
    let owners = register_n(&env, &client, 6);

    client.shuffle(&admin);
    assert!(client.is_shuffled());

    for owner in owners.iter() {
        let match_box = client.my_match(&owner);
        assert_ne!(match_box.owner, owner, "nadie se puede autoasignar");
    }
}

#[test]
fn test_my_match_funciona_apenas_se_sortea() {
    let (env, client, admin, _unlock) = setup();
    let owners = register_n(&env, &client, 3);

    client.shuffle(&admin);

    // No hace falta esperar el unlock_timestamp para saber a quien le mando.
    let first = owners.get(0).unwrap();
    let match_box = client.my_match(&first);
    assert_ne!(match_box.owner, first);
}

#[test]
#[should_panic(expected = "todavia no llega el momento de abrir tu caja")]
fn test_my_admirer_falla_antes_del_unlock() {
    let (env, client, admin, _unlock) = setup();
    let owners = register_n(&env, &client, 2);

    client.shuffle(&admin);
    let first = owners.get(0).unwrap();
    client.my_admirer(&first);
}

#[test]
fn test_my_admirer_funciona_despues_del_unlock() {
    let (env, client, admin, unlock_timestamp) = setup();
    let owners = register_n(&env, &client, 2);

    client.shuffle(&admin);

    env.ledger().set_timestamp(unlock_timestamp);

    let first = owners.get(0).unwrap();
    let admirer_box = client.my_admirer(&first);
    assert_ne!(admirer_box.owner, first);
}

#[test]
fn test_unregister_solo_admin_puede_quitar() {
    let (env, client, admin, _unlock) = setup();
    let owners = register_n(&env, &client, 1);
    assert_eq!(client.list().len(), 1);

    let first = owners.get(0).unwrap();
    client.unregister(&admin, &first);
    assert_eq!(client.list().len(), 0);
}

#[test]
#[should_panic(expected = "solo el facilitador puede quitar participantes")]
fn test_unregister_falla_si_no_es_admin() {
    let (env, client, _admin, _unlock) = setup();
    let owners = register_n(&env, &client, 1);
    let impostor = Address::generate(&env);

    let first = owners.get(0).unwrap();
    client.unregister(&impostor, &first);
}
