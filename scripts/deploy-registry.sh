#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
#  ⭐ deploy-registry.sh — SOLO PARA EL FACILITADOR
#
#  Despliega UNA vez el tablero compartido del taller y reparte el
#  REGISTRY_ID a toda la sala. Los participantes NO corren este script.
#
#  Uso: ./scripts/deploy-registry.sh <alias-facilitador>
# ═══════════════════════════════════════════════════════════════════
set -euo pipefail

BOLD='\033[1m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
RED='\033[1;31m'
RESET='\033[0m'

ALIAS="${1:-facilitador}"

if ! command -v stellar >/dev/null 2>&1; then
  echo -e "${RED}❌ No encontre el comando 'stellar'. Estas dentro del Codespace?${RESET}"
  exit 1
fi

CONTRACT_DIR="registry/token_registry"
WASM_PATH="target/wasm32v1-none/release/token_registry.wasm"

echo -e "${YELLOW}🔑 Paso 1/4 — Preparando la identidad del facilitador ('${ALIAS}')...${RESET}"
if stellar keys address "$ALIAS" >/dev/null 2>&1; then
  echo "   Ya existe una identidad '${ALIAS}'. La reutilizo."
else
  stellar keys generate "$ALIAS" --network testnet --fund
  echo "   Identidad creada y fondeada con Friendbot ✅"
fi
ADMIN_ADDRESS="$(stellar keys address "$ALIAS")"
echo "   Address del facilitador: ${ADMIN_ADDRESS}"
echo

echo -e "${YELLOW}🛠  Paso 2/4 — Compilando el tablero compartido...${RESET}"
(cd "$CONTRACT_DIR" && stellar contract build)
echo "   Compilado ✅"
echo

if [ ! -f "$WASM_PATH" ]; then
  echo -e "${RED}❌ No encontre el .wasm compilado en ${WASM_PATH}${RESET}"
  exit 1
fi

echo -e "${YELLOW}🚀 Paso 3/4 — Desplegando el tablero en Testnet...${RESET}"
REGISTRY_ID="$(stellar contract deploy \
  --wasm "$WASM_PATH" \
  --source-account "$ALIAS" \
  --network testnet \
  --alias "token_registry")"
echo "   Desplegado ✅"
echo

echo -e "${YELLOW}⚡ Paso 4/4 — Inicializando el tablero...${RESET}"
stellar contract invoke \
  --id "$REGISTRY_ID" \
  --source-account "$ALIAS" \
  --network testnet \
  -- \
  initialize \
  --admin "$ADMIN_ADDRESS"
echo "   Tablero inicializado ✅"
echo

echo -e "${GREEN}${BOLD}🎉 El tablero compartido del taller ya esta en Testnet!${RESET}"
echo
echo -e "   ${BOLD}REGISTRY_ID:${RESET} ${REGISTRY_ID}"
echo
echo "👉 Reparte este REGISTRY_ID a toda la sala (chat, pizarra, etc)."
echo "   Cada participante lo pega en frontend/.env como:"
echo "   VITE_TOKEN_REGISTRY_CONTRACT_ID=${REGISTRY_ID}"
echo
