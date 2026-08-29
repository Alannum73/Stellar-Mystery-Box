# 🕵️ RETOS — Stellar Mystery Box

Cuatro retos, cuatro commits, un token propio y un sorteo tipo "amigo
invisible" en Stellar Testnet: creas tu moneda, le agregas un poder, la
desplegas, te anotas en el sorteo compartido de la sala, y el contrato
decide quien le manda su caja a quien, sin que nadie se autoasigne. Cada
reto tiene una **Ruta Explorer** (copiar, pegar, ajustar un par de
valores, cualquiera la termina) y, al final de todo, **Retos Builder**
opcionales para quien quiera ir mas lejos.

No hace falta que entiendas cada linea de codigo. Hace falta que sigas los
pasos, en orden, y que hagas el commit de cada reto.

---

## 📦 Reto 0 — Abre tu caja

Antes de personalizar nada, descubre que hay adentro de tu caja
misteriosa.

1. Levanta el frontend:

   ```bash
   pnpm run dev
   ```

   Abre el puerto **5173** que Codespaces te va a ofrecer reenviar.

2. En la tarjeta "Tu Caja Misteriosa", haz clic en **🎲 Revelar mi
   caja**.

Vas a ver un tema al azar (Fuego 🔥, Agua 🌊, Cosmos 🌌...) con un nombre,
un simbolo y un color sugeridos. Quedan guardados en tu navegador, asi que
no se pierden si recargas la pagina. Anotalos (o dejalos ahi a la vista),
los usas en el Reto 1. Si en algun momento queres probar otro tema, el
mismo boton dice "Probar otro tema" y te tira uno nuevo.

> 💡 Si preferis la terminal, tambien podes correr `pnpm run reveal` para
> obtener un tema al azar ahi mismo.

---

## 📦 Reto 1 — Personaliza tu token misterioso

**Que vas a lograr:** que tu token deje de llamarse "CAMBIAME" y pase a
tener el nombre y el tema de tu caja.

### Pasos

1. Abre `contracts/mystery_token/src/lib.rs`.
2. Busca el bloque que dice `RETO 1` cerca del principio del archivo.
3. Cambia estas constantes por los valores que te mostro tu caja al
   revelarla (o los que quieras inventar):

   ```rust
   const TOKEN_NAME: &str = "CAMBIAME";      // ej: "Token de Fuego"
   const TOKEN_SYMBOL: &str = "XXX";          // ej: "FUE" (3-5 letras)
   const TOKEN_DECIMALS: u32 = 7;             // dejalo en 7
   const INITIAL_SUPPLY: i128 = 1_000_000;    // puedes cambiarlo si quieres
   ```

4. (Opcional pero recomendado) Abre `frontend/src/config/tokenConfig.ts` y
   pon el emoji, el color y el lema de tu caja ahi tambien.

### ✅ Como se que lo logre

Guardaste el archivo, cambiaste `TOKEN_NAME` y `TOKEN_SYMBOL` por los
tuyos, y ya no dice "CAMBIAME" ni "XXX".

### Commit 1

```bash
git add . && git commit -m "Reto 1: mi token" && git push
```

---

## ⚡ Reto 2 — Activa el poder de tu token

**Que vas a lograr:** completar la funcion `transfer_with_fee`, una
transferencia especial que cobra una pequeña comision del 1% y la "quema"
(la saca de circulacion para siempre). Esta es literalmente la funcion que
vas a usar en el Reto 4 para mandarle tu caja a quien te toque en el
sorteo, asi que vale la pena entenderla.

### Pasos

1. En el mismo archivo (`contracts/mystery_token/src/lib.rs`), busca el
   bloque `RETO 2`.
2. Vas a ver una funcion con **pistas** en comentarios (🔍) y, al final,
   un `panic!(...)` de relleno. Reemplaza ese `panic!` completando la
   logica que piden las pistas. Necesitas, en este orden:
   - calcular la comision (`fee`) como el 1% del monto (`amount / 100`)
   - calcular cuanto llega de verdad al destinatario (`net = amount - fee`)
   - restarle `amount` (el monto completo) al balance de quien envia
   - sumarle `net` al balance de quien recibe
   - restarle `fee` al supply total (asi se "quema")

   Fijate como esta resuelta la funcion `transfer` (un poco mas arriba)
   como referencia, usa las mismas funciones (`read_balance`,
   `write_balance`, `read_supply`, `write_supply`).

3. Corre los tests:

   ```bash
   pnpm run test:contracts
   ```

   Vas a ver varios tests fallando (son justo los del Reto 2). Ve
   ajustando tu codigo hasta que todos pasen en verde.

### 🔍 Ruta Explorer (si prefieres copiar y entender despues)

```rust
pub fn transfer_with_fee(env: Env, from: Address, to: Address, amount: i128) {
    from.require_auth();

    if amount <= 0 {
        panic!("el monto tiene que ser mayor a cero");
    }

    let from_balance = read_balance(&env, &from);
    if from_balance < amount {
        panic!("saldo insuficiente");
    }

    let fee = amount / 100;
    let net = amount - fee;

    let to_balance = read_balance(&env, &to);
    write_balance(&env, &from, from_balance - amount);
    write_balance(&env, &to, to_balance + net);

    let supply = read_supply(&env);
    write_supply(&env, supply - fee);
}
```

### ✅ Como se que lo logre

`pnpm run test:contracts` corre y **todos** los tests aparecen en verde
(`ok`), sin ningun `FAILED`.

### Commit 2

```bash
git add . && git commit -m "Reto 2: active el poder de mi token" && git push
```

---

## 🚀 Reto 3 — Despliega en Testnet

**Que vas a lograr:** que tu token exista de verdad en la red de pruebas
de Stellar, con su propia direccion (CONTRACT_ID), y que tu billetera de
Freighter quede conectada a esa misma cuenta.

### Pasos

1. Elige un alias corto para tu identidad (por ejemplo, tu nombre). Una
   identidad es un par de claves (alias local, clave publica y clave
   secreta) que la Stellar CLI usa para firmar comandos como este. Todavia
   no es la misma cuenta que va a usar tu billetera del navegador, eso lo
   conectamos en el paso 4. Corre:

   ```bash
   pnpm run deploy:testnet tu-alias
   ```

   Esto crea tu identidad, le carga saldo de prueba con Friendbot (XLM de
   prueba, sin valor real), compila tu contrato, lo publica en Testnet y
   lo inicializa (acuña tu `INITIAL_SUPPLY` a nombre de esa identidad).

2. Al final vas a ver algo como:

   ```
   CONTRACT_ID: CABC...XYZ
   ```

   Copia ese ID.

3. Pegalo en dos lugares:
   - En [`MI-TOKEN.md`](./MI-TOKEN.md), campo `CONTRACT_ID`.
   - En `frontend/.env` (crealo copiando `frontend/.env.example` si
     todavia no existe), en la variable `VITE_MYSTERY_TOKEN_CONTRACT_ID`.

4. Importa esa misma identidad en Freighter. Tu moneda se acuño a nombre
   de la identidad que creaste en el paso 1, no de una billetera nueva:
   si en el Reto 4 conectas una billetera distinta, vas a ver tu balance
   en cero aunque tu moneda si exista. Para evitarlo, muestra la clave
   secreta de tu identidad:

   ```bash
   stellar keys secret tu-alias
   ```

   Copia la clave secreta que aparece (empieza con `S...`). Despues, en
   Freighter: menu (los tres puntos) → "Add account" → "Import a Stellar
   secret key" → pegala ahi. Verifica que la red siga en Testnet y deja
   esa cuenta seleccionada como la activa: va a ser la billetera que
   conectes en el Reto 4.

   ⚠️ Esa clave es solo de Testnet, sin valor real, y es tuya: nunca la
   compartas ni la subas al repositorio. Cada participante genera y usa
   unicamente su propia identidad, nadie necesita la clave de nadie mas.

### ✅ Como se que lo logre

El script termino sin errores, tienes un `CONTRACT_ID` que empieza con
`C` pegado en `MI-TOKEN.md` y en `frontend/.env`, y ya importaste la
clave secreta de tu identidad en Freighter (paso 4).

### Commit 3

```bash
git add . && git commit -m "Reto 3: desplegado en Testnet" && git push
```

> ⚠️ No hagas commit de tu `frontend/.env` con datos sensibles: tranquilo,
> el `CONTRACT_ID` no es secreto, pero el `.gitignore` del repo igual
> excluye `frontend/.env` por prolijidad. Anotalo tambien en
> `MI-TOKEN.md`, que si se guarda en el repositorio.

---

## ⭐ Reto 4 — Sumate al sorteo y descubri quien te toco

**Que vas a lograr:** anotarte en el sorteo compartido de la sala,
mandarle tu caja a quien te toque, y descubrir quien te la manda a vos.

### Pasos

1. Levanta el frontend (si no lo tienes corriendo ya):

   ```bash
   pnpm run dev
   ```

   Abre el puerto **5173** que Codespaces te va a ofrecer reenviar.

2. Necesitas el `EXCHANGE_ID` del sorteo, te lo da quien organiza el
   taller. Pegalo en `frontend/.env`, en
   `VITE_MYSTERY_EXCHANGE_CONTRACT_ID`.

3. Sumate al sorteo desde el frontend (boton **🎲 Sumarme al sorteo**
   dentro de la tarjeta "El sorteo", despues de conectar tu billetera) o
   desde la terminal:

   ```bash
   pnpm run register tu-alias TU_CONTRACT_ID EXCHANGE_ID
   ```

4. Espera. Cuando la mayoria de la sala ya se anoto, quien organiza el
   taller dispara el sorteo. Apenas eso pasa, en la tarjeta "El sorteo"
   vas a ver a quien le tenes que mandar tu caja (con su emoji, nombre y
   lema).

5. Elegi cuanto de tu moneda le queres regalar y toca **🎁 Enviar mi
   caja**. Esto llama a tu `transfer_with_fee` (el poder que activaste en
   el Reto 2), asi que a quien le mandes le va a llegar el monto menos la
   comision del 1%.

6. Mas adelante (cuando llegue el horario que fijo quien organiza el
   taller) vas a ver ahi mismo quien te mando la caja a vos, y cuanto ya
   tenes de esa moneda.

7. Busca tu contrato en **Stellar Expert** (el explorador de la red de
   Stellar) para tener un link publico de tu token:

   ```
   https://stellar.expert/explorer/testnet/contract/TU_CONTRACT_ID
   ```

8. Completa [`MI-TOKEN.md`](./MI-TOKEN.md) con todos los campos, incluido
   ese link.

### ✅ Como se que lo logre

Te anotaste en el sorteo, le mandaste tu caja a quien te toco (viste la
confirmacion en pantalla), y `MI-TOKEN.md` esta completo.

### Commit 4

```bash
git add . && git commit -m "Reto 4: mande mi caja" && git push
```

🎉 **Listo! Ya tienes 4 commits y participaste del sorteo en Stellar.**

---

## 🛠 Retos Builder (opcionales, para quien va rapido)

Si terminaste los 4 retos y sobra tiempo, prueba alguno de estos, y de
paso, ayuda a algun compañero que vaya mas atras:

- **Segundo poder:** agrega una funcion nueva al contrato (por ejemplo,
  `airdrop` que le mande una cantidad fija a varias direcciones de una).
- **Estetica propia:** personaliza los colores y el diseño del frontend
  en `frontend/src/styles.css`.
- **Segundo token:** publica una segunda caja con otro tema, cambiando
  las constantes del Reto 1 y corriendo `deploy-testnet.sh` con otro
  alias.
