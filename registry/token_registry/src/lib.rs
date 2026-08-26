#![no_std]

// ══════════════════════════════════════════════════════════════════════
//  ⭐ TOKEN REGISTRY — el tablero compartido del taller
//
//  Este contrato lo despliega UNA sola vez el facilitador
//  (ver scripts/deploy-registry.sh). Los participantes solo lo invocan
//  para registrar su propio token en la sala.
// ══════════════════════════════════════════════════════════════════════

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Vec};

#[derive(Clone)]
#[contracttype]
pub struct TokenInfo {
    pub contract_id: Address,
    pub name: String,
    pub symbol: String,
    pub owner: Address,
    pub emoji: String,
    pub tagline: String,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Admin,
    Tokens,
}

fn read_tokens(env: &Env) -> Vec<TokenInfo> {
    env.storage()
        .persistent()
        .get(&DataKey::Tokens)
        .unwrap_or(Vec::new(env))
}

fn write_tokens(env: &Env, tokens: &Vec<TokenInfo>) {
    env.storage().persistent().set(&DataKey::Tokens, tokens);
}

#[contract]
pub struct TokenRegistry;

#[contractimpl]
impl TokenRegistry {
    /// Deja a `admin` (el facilitador) como dueño del tablero. Se llama una
    /// sola vez, justo despues de desplegar el contrato.
    pub fn initialize(env: Env, admin: Address) {
        admin.require_auth();

        if env.storage().instance().has(&DataKey::Admin) {
            panic!("el tablero ya fue inicializado");
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        write_tokens(&env, &Vec::new(&env));
    }

    /// Cualquier participante registra su propio token en el tablero.
    pub fn register(
        env: Env,
        token_contract: Address,
        name: String,
        symbol: String,
        emoji: String,
        tagline: String,
        owner: Address,
    ) {
        owner.require_auth();

        let mut tokens = read_tokens(&env);

        for token in tokens.iter() {
            if token.contract_id == token_contract {
                panic!("este token ya esta registrado en el tablero");
            }
        }

        tokens.push_back(TokenInfo {
            contract_id: token_contract,
            name,
            symbol,
            owner,
            emoji,
            tagline,
        });

        write_tokens(&env, &tokens);
    }

    /// Solo el facilitador puede sacar un token del tablero (ej. pruebas).
    pub fn unregister(env: Env, admin: Address, token_contract: Address) {
        admin.require_auth();

        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("el tablero no fue inicializado");

        if admin != stored_admin {
            panic!("solo el facilitador puede quitar tokens del tablero");
        }

        let tokens = read_tokens(&env);
        let mut remaining = Vec::new(&env);
        for token in tokens.iter() {
            if token.contract_id != token_contract {
                remaining.push_back(token);
            }
        }

        write_tokens(&env, &remaining);
    }

    /// Devuelve todos los tokens registrados, para pintarlos en el frontend.
    pub fn list(env: Env) -> Vec<TokenInfo> {
        read_tokens(&env)
    }
}

mod test;
