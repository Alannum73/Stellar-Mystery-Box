# 🎁 Stellar Mystery Box

Bienvenido/a a Stellar Mystery Box, un taller de 2-3 horas donde vas a abrir
tu propia caja misteriosa, convertirla en una moneda digital real de
Stellar (construida con Rust + Soroban), darle un poder secreto,
publicarla en una red de pruebas (Testnet, sin dinero real) y sumarte a un
sorteo tipo "amigo invisible" con el resto de la sala: el contrato decide
quien le manda su caja a quien, sin que nadie se autoasigne.

No necesitas saber programar, ni conocer Stellar, ni nada previo. Todo
corre en tu navegador con GitHub Codespaces: no instalas nada en tu
computadora.

## Paso a paso para empezar

### 1. Haz un fork del repositorio

Arriba a la derecha de esta pagina, haz clic en **Fork** para crear tu
propia copia en tu cuenta de GitHub. Vas a trabajar y a guardar tus
avances (commits) sobre tu fork, no sobre este repositorio original.

### 2. Abre tu fork en un Codespace

Ya en tu fork (no en este repositorio):

1. Haz clic en el boton verde **`<> Code`**.
2. Entra en la pestaña **Codespaces**.
3. Haz clic en **Create codespace on main**.

Se va a abrir un editor de codigo completo en tu navegador, funcionando en
internet, sin instalar nada en tu computadora.

### 3. Espera el primer arranque

El Codespace se prepara solo, en segundo plano: instala todo lo necesario
para trabajar con Rust, con Stellar y con la aplicacion web. Esto puede
tardar unos minutos la primera vez, es normal, no hace falta que hagas
nada. Conviene abrir el Codespace apenas empieza el taller para no perder
tiempo esperando.

Cuando termine, vas a ver un mensaje de bienvenida en la terminal (la
pantalla negra de texto, en la parte de abajo). Puedes confirmar que todo
esta listo escribiendo, uno por uno, estos comandos:

```bash
stellar --version
rustup target list --installed | grep wasm32
pnpm --version
```

Si los tres responden algo (sin ningun error), ya puedes seguir.

### 4. Instala y configura tu billetera Freighter

**[Freighter](https://www.freighter.app/)** es una billetera digital para
Stellar: una extension de navegador que guarda tus monedas y firma tus
operaciones en tu nombre, como una llave digital. Instalala en tu navegador
normal (no dentro del Codespace) y crea una billetera nueva. Despues,
dentro de Freighter:

1. Abre la extension y entra en el icono de engranaje (Configuracion).
2. Busca la opcion de red (Network).
3. Elige **Testnet** (la red de pruebas, sin dinero real).

Todavia no necesitas cargarle saldo a la billetera, eso lo haces mas
adelante, durante el propio taller.

### 5. Sigue los retos

Abre [`RETOS.md`](./RETOS.md): ahi esta la guia completa, paso a paso, de
los 4 retos del taller. Cada reto termina con un commit en tu fork, y esa
es la forma en que medimos el avance de la sala. El objetivo es que
llegues al Commit 4 con tu propia moneda funcionando de verdad en Stellar
Testnet.

## Que vas a construir

- Una **moneda digital propia** sobre Stellar (tecnicamente, un
  "contrato inteligente" escrito en Rust), con nombre, simbolo y un poder
  secreto que completas siguiendo pistas.
- Una **aplicacion web** donde conectas tu billetera, creas tu moneda, la
  sumas al sorteo compartido de la sala y le mandas tu caja a quien te
  toque, en vivo.

## Requisitos locales (sólo si no usas Codespaces)

Necesitas instalar estas cinco herramientas. Si nunca las usaste, aquí va para qué sirve cada una:

- **git** — para clonar (descargar) este repositorio.
- **Node.js (18+) con pnpm** — para instalar y correr el frontend (la página web).
- **Rust con el target `wasm32v1-none`** — para compilar el contrato de Rust a WebAssembly, el formato que Soroban ejecuta en la red.
- **Stellar CLI** (`stellar`) — la herramienta de línea de comandos oficial para crear identidades, desplegar contratos e interactuar con la red Stellar.

A continuación, cómo instalar cada una según tu sistema operativo.

> 🪟 **¿Usas Windows?** Se recomienda instalar [WSL2](https://learn.microsoft.com/es-es/windows/wsl/install) (Windows Subsystem for Linux) y ejecutar **todos** los comandos de este README dentro de tu distro WSL (ej. Ubuntu), no en PowerShell/CMD. La Stellar CLI y las herramientas de Rust no ofrecen soporte confiable en Windows nativo. Una vez dentro de WSL, sigue las instrucciones de "Linux" de abajo.

<details>
<summary><strong>Linux / WSL2 (Ubuntu/Debian)</strong></summary>

```bash
# git (normalmente ya viene instalado; si no):
sudo apt update && sudo apt install -y git build-essential pkg-config libssl-dev

# Node.js 18+ (via nvm, evita permisos raros de npm global)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install --lts

# pnpm
corepack enable

# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
rustup target add wasm32v1-none

# Stellar CLI (tarda varios minutos en compilar)
cargo install --locked stellar-cli --no-default-features
```
</details>

<details>
<summary><strong>macOS</strong></summary>

```bash
# Homebrew, si no lo tienes: https://brew.sh
brew install git node

# pnpm
corepack enable

# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
rustup target add wasm32v1-none

# Stellar CLI (tarda varios minutos en compilar)
cargo install --locked stellar-cli --no-default-features
```
</details>

Después de instalar, verifica que todo esté en el `PATH` con:
```bash
git --version && node --version && pnpm --version && rustc --version && stellar --version
```
Si algún comando "no se encuentra" tras instalarlo, cierra y vuelve a abrir la terminal (o corre `source ~/.bashrc` / `source ~/.zshrc`) para que tome el `PATH` actualizado.

## Estructura del repositorio

```
contracts/mystery_token/   -> tu moneda (Reto 1 y Reto 2 se editan aca)
registry/mystery_exchange/ -> el sorteo compartido (lo publica quien organiza el taller)
scripts/                   -> los comandos que vas a usar en cada reto
frontend/                  -> la aplicacion web para conectar tu billetera
RETOS.md                   -> la guia paso a paso del taller
MI-TOKEN.md                -> tu comprobante final
```

## Algo no funciona?

Revisa primero la seccion de tu reto en [`RETOS.md`](./RETOS.md): cada uno
tiene un punto de control ("Como se que lo logre"). Si sigues sin poder
avanzar, avisa a quien dicta el taller o a algun compañero.
