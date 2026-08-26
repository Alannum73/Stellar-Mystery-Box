#![cfg(test)]

use super::{TokenRegistry, TokenRegistryClient};
use soroban_sdk::{testutils::Address as _, Address, Env, String};

fn setup() -> (Env, TokenRegistryClient<'static>, Address) {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(TokenRegistry, ());
    let client = TokenRegistryClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin);

    (env, client, admin)
}

#[test]
fn test_initialize_deja_lista_vacia() {
    let (_env, client, _admin) = setup();
    assert_eq!(client.list().len(), 0);
}

#[test]
fn test_register_agrega_un_token() {
    let (env, client, _admin) = setup();

    let token_contract = Address::generate(&env);
    let owner = Address::generate(&env);

    client.register(
        &token_contract,
        &String::from_str(&env, "Token de Fuego"),
        &String::from_str(&env, "FUE"),
        &String::from_str(&env, "🔥"),
        &String::from_str(&env, "Arde donde pisa"),
        &owner,
    );

    let tokens = client.list();
    assert_eq!(tokens.len(), 1);
    assert_eq!(tokens.get(0).unwrap().symbol, String::from_str(&env, "FUE"));
}

#[test]
#[should_panic(expected = "este token ya esta registrado en el tablero")]
fn test_register_no_permite_duplicados() {
    let (env, client, _admin) = setup();

    let token_contract = Address::generate(&env);
    let owner = Address::generate(&env);

    client.register(
        &token_contract,
        &String::from_str(&env, "Token de Agua"),
        &String::from_str(&env, "AGU"),
        &String::from_str(&env, "🌊"),
        &String::from_str(&env, "Fluye siempre"),
        &owner,
    );

    client.register(
        &token_contract,
        &String::from_str(&env, "Token de Agua"),
        &String::from_str(&env, "AGU"),
        &String::from_str(&env, "🌊"),
        &String::from_str(&env, "Fluye siempre"),
        &owner,
    );
}

#[test]
fn test_unregister_solo_admin_puede_quitar() {
    let (env, client, admin) = setup();

    let token_contract = Address::generate(&env);
    let owner = Address::generate(&env);

    client.register(
        &token_contract,
        &String::from_str(&env, "Token de Aire"),
        &String::from_str(&env, "AIR"),
        &String::from_str(&env, "💨"),
        &String::from_str(&env, "Ligero como el viento"),
        &owner,
    );
    assert_eq!(client.list().len(), 1);

    client.unregister(&admin, &token_contract);
    assert_eq!(client.list().len(), 0);
}

#[test]
#[should_panic(expected = "solo el facilitador puede quitar tokens del tablero")]
fn test_unregister_falla_si_no_es_admin() {
    let (env, client, _admin) = setup();

    let token_contract = Address::generate(&env);
    let impostor = Address::generate(&env);

    client.unregister(&impostor, &token_contract);
}
