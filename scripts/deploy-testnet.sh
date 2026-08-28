#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
#  🚀 deploy-testnet.sh — Reto 3: despliega tu token en Stellar Testnet
#
#  Uso: pnpm run deploy:testnet <tu-alias>
#       (o directamente: ./scripts/deploy-testnet.sh <tu-alias>)
# ═══════════════════════════════════════════════════════════════════
set -euo pipefail

BOLD='\033[1m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
RED='\033[1;31m'
RESET='\033[0m'

ALIAS="${1:-}"

if [ -z "$ALIAS" ]; then
  echo -e "${RED}❌ Te falta darle un alias a tu identidad.${RESET}"
  echo "   Uso: ./scripts/deploy-testnet.sh <tu-alias>"
  echo "   Ejemplo: ./scripts/deploy-testnet.sh jennifer"
  exit 1
fi

if ! command -v stellar >/dev/null 2>&1; then
  echo -e "${RED}❌ No encontre el comando 'stellar'. Estas dentro del Codespace?${RESET}"
  exit 1
fi

CONTRACT_DIR="contracts/mystery_token"
WASM_PATH="target/wasm32v1-none/release/mystery_token.wasm"

echo -e "${YELLOW}🔑 Paso 1/4 — Preparando tu identidad '${ALIAS}' en Testnet...${RESET}"
if stellar keys address "$ALIAS" >/dev/null 2>&1; then
  echo "   Ya existe una identidad '${ALIAS}'. La reutilizo."
else
  stellar keys generate "$ALIAS" --network testnet --fund
  echo "   Identidad creada y fondeada con Friendbot ✅"
fi
OWNER_ADDRESS="$(stellar keys address "$ALIAS")"
echo "   Tu address: ${OWNER_ADDRESS}"
echo

echo -e "${YELLOW}🛠  Paso 2/4 — Compilando tu contrato...${RESET}"
(cd "$CONTRACT_DIR" && stellar contract build)
echo "   Compilado ✅"
echo

if [ ! -f "$WASM_PATH" ]; then
  echo -e "${RED}❌ No encontre el .wasm compilado en ${WASM_PATH}${RESET}"
  echo "   Si el nombre del target cambio, revisa la documentacion oficial de Stellar CLI."
  exit 1
fi

echo -e "${YELLOW}🚀 Paso 3/4 — Desplegando en Testnet...${RESET}"
CONTRACT_ID="$(stellar contract deploy \
  --wasm "$WASM_PATH" \
  --source-account "$ALIAS" \
  --network testnet \
  --alias "mystery_token_${ALIAS}")"
echo "   Desplegado ✅"
echo

echo -e "${YELLOW}⚡ Paso 4/4 — Inicializando tu token (acuñando el supply)...${RESET}"
stellar contract invoke \
  --id "$CONTRACT_ID" \
  --source-account "$ALIAS" \
  --network testnet \
  -- \
  initialize \
  --owner "$OWNER_ADDRESS"
echo "   Token inicializado ✅"
echo

echo -e "${GREEN}${BOLD}🎉 Tu token ya vive en Stellar Testnet!${RESET}"
echo
echo -e "   ${BOLD}CONTRACT_ID:${RESET} ${CONTRACT_ID}"
echo
echo "👉 Pega este CONTRACT_ID en dos lugares:"
echo "   1. MI-TOKEN.md (campo 'CONTRACT_ID')"
echo "   2. frontend/.env (variable VITE_MYSTERY_TOKEN_CONTRACT_ID)"
echo
echo "Despues, guarda tu avance:"
echo -e "${BOLD}   git add . && git commit -m \"Reto 3: desplegado en Testnet\" && git push${RESET}"
echo
