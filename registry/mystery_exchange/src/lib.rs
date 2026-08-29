#![no_std]

// ══════════════════════════════════════════════════════════════════════
//  🎲 MYSTERY EXCHANGE — el sorteo "amigo invisible" del taller
//
//  Este contrato lo despliega UNA sola vez el facilitador
//  (ver scripts/deploy-exchange.sh). Cada participante se registra con SU
//  PROPIO token (mystery_token), y este contrato sortea quien le manda a
//  quien, garantizando que nadie se autoasigna. El envio real del regalo
//  pasa aca afuera: cada quien llama `transfer_with_fee` en su propio
//  contrato hacia quien le toco en el sorteo.
// ══════════════════════════════════════════════════════════════════════

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Vec};

#[derive(Clone)]
#[contracttype]
pub struct BoxEntry {
    pub owner: Address,
    pub token_contract: Address,
    pub name: String,
    pub symbol: String,
    pub emoji: String,
    pub tagline: String,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Admin,
    UnlockTimestamp,
    Shuffled,
    Boxes,
    Pairs,
}

fn read_boxes(env: &Env) -> Vec<BoxEntry> {
    env.storage()
        .persistent()
        .get(&DataKey::Boxes)
        .unwrap_or(Vec::new(env))
}

fn write_boxes(env: &Env, boxes: &Vec<BoxEntry>) {
    env.storage().persistent().set(&DataKey::Boxes, boxes);
}

fn read_pairs(env: &Env) -> Vec<(Address, Address)> {
    env.storage()
        .persistent()
        .get(&DataKey::Pairs)
        .unwrap_or(Vec::new(env))
}

fn is_shuffled(env: &Env) -> bool {
    env.storage()
        .instance()
        .get(&DataKey::Shuffled)
        .unwrap_or(false)
}

fn read_admin(env: &Env) -> Address {
    env.storage()
        .instance()
        .get(&DataKey::Admin)
        .expect("el intercambio no fue inicializado")
}

fn find_box(env: &Env, owner: &Address) -> BoxEntry {
    let boxes = read_boxes(env);
    for b in boxes.iter() {
        if &b.owner == owner {
            return b;
        }
    }
    panic!("no se encontro la caja de este participante");
}

#[contract]
pub struct MysteryExchange;

#[contractimpl]
impl MysteryExchange {
    /// Deja a `admin` (el facilitador) a cargo, y fija el momento (ledger
    /// timestamp, en segundos) a partir del cual se puede ver quien manda
    /// la caja de cada participante.
    pub fn initialize(env: Env, admin: Address, unlock_timestamp: u64) {
        admin.require_auth();

        if env.storage().instance().has(&DataKey::Admin) {
            panic!("el intercambio ya fue inicializado");
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::UnlockTimestamp, &unlock_timestamp);
        env.storage().instance().set(&DataKey::Shuffled, &false);
        write_boxes(&env, &Vec::new(&env));
    }

    /// Cualquier participante se suma al sorteo con su propio token.
    pub fn register(
        env: Env,
        owner: Address,
        token_contract: Address,
        name: String,
        symbol: String,
        emoji: String,
        tagline: String,
    ) {
        owner.require_auth();

        if is_shuffled(&env) {
            panic!("el sorteo ya se hizo, no se puede registrar mas");
        }

        let mut boxes = read_boxes(&env);
        for b in boxes.iter() {
            if b.owner == owner {
                panic!("ya te registraste en el sorteo");
            }
        }

        boxes.push_back(BoxEntry {
            owner,
            token_contract,
            name,
            symbol,
            emoji,
            tagline,
        });
        write_boxes(&env, &boxes);
    }

    /// Solo el facilitador, y una sola vez: baraja a los participantes y arma
    /// quien le manda la caja a quien, sin que nadie se autoasigne.
    pub fn shuffle(env: Env, admin: Address) {
        admin.require_auth();

        if admin != read_admin(&env) {
            panic!("solo el facilitador puede sortear");
        }
        if is_shuffled(&env) {
            panic!("el sorteo ya se hizo");
        }

        let boxes = read_boxes(&env);
        if boxes.len() < 2 {
            panic!("hacen falta al menos 2 participantes para sortear");
        }

        let mut owners: Vec<Address> = Vec::new(&env);
        for b in boxes.iter() {
            owners.push_back(b.owner.clone());
        }

        env.prng().shuffle(&mut owners);

        // Cada quien le manda al siguiente en el orden ya barajado (y el
        // ultimo le manda al primero). Como es un solo ciclo que pasa por
        // todos, nadie puede quedar apuntando a si mismo.
        let mut pairs: Vec<(Address, Address)> = Vec::new(&env);
        let n = owners.len();
        for i in 0..n {
            let sender = owners.get(i).unwrap();
            let recipient = owners.get((i + 1) % n).unwrap();
            pairs.push_back((sender, recipient));
        }

        env.storage().persistent().set(&DataKey::Pairs, &pairs);
        env.storage().instance().set(&DataKey::Shuffled, &true);
    }

    /// A quien le tengo que mandar mi caja. Disponible apenas se sortea,
    /// sin esperar el unlock, para no obligar a todo el salon a mandar en
    /// el mismo instante.
    pub fn my_match(env: Env, caller: Address) -> BoxEntry {
        let pairs = read_pairs(&env);
        for (sender, recipient) in pairs.iter() {
            if sender == caller {
                return find_box(&env, &recipient);
            }
        }
        panic!("todavia no se hizo el sorteo, o no estas registrado");
    }

    /// Quien me manda la caja a mi. Esta si queda bloqueada hasta el
    /// unlock_timestamp: es el momento de la sorpresa real.
    pub fn my_admirer(env: Env, caller: Address) -> BoxEntry {
        let unlock_timestamp: u64 = env
            .storage()
            .instance()
            .get(&DataKey::UnlockTimestamp)
            .unwrap_or(0);
        if env.ledger().timestamp() < unlock_timestamp {
            panic!("todavia no llega el momento de abrir tu caja");
        }

        let pairs = read_pairs(&env);
        for (sender, recipient) in pairs.iter() {
            if recipient == caller {
                return find_box(&env, &sender);
            }
        }
        panic!("todavia no se hizo el sorteo, o no estas registrado");
    }

    /// Devuelve todas las cajas registradas, para el tablero publico.
    pub fn list(env: Env) -> Vec<BoxEntry> {
        read_boxes(&env)
    }

    /// Si ya se hizo el sorteo. Le sirve al frontend para saber que mostrar,
    /// sin depender de que una funcion falle para deducir el estado.
    pub fn is_shuffled(env: Env) -> bool {
        is_shuffled(&env)
    }

    /// El ledger timestamp (segundos) a partir del cual se puede ver quien
    /// manda la caja de cada participante.
    pub fn unlock_timestamp(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::UnlockTimestamp)
            .unwrap_or(0)
    }

    /// Solo el facilitador puede sacar un participante (ej. pruebas).
    pub fn unregister(env: Env, admin: Address, owner: Address) {
        admin.require_auth();

        if admin != read_admin(&env) {
            panic!("solo el facilitador puede quitar participantes");
        }

        let boxes = read_boxes(&env);
        let mut remaining = Vec::new(&env);
        for b in boxes.iter() {
            if b.owner != owner {
                remaining.push_back(b);
            }
        }
        write_boxes(&env, &remaining);
    }
}

mod test;
