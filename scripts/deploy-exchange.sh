#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
#  🎲 deploy-exchange.sh — SOLO PARA EL FACILITADOR
#
#  Despliega UNA vez el sorteo compartido del taller (amigo invisible) y
#  reparte el EXCHANGE_ID a toda la sala. Los participantes NO corren este
#  script.
#
#  Uso: ./scripts/deploy-exchange.sh <alias-facilitador> [minutos-hasta-el-sorteo]
#  El segundo argumento es opcional (por defecto 150 minutos, pensado para
#  un taller de 2h30) y es cuanto tiempo despues de este deploy se puede
#  ver quien le manda la caja a cada quien.
# ═══════════════════════════════════════════════════════════════════
set -euo pipefail

BOLD='\033[1m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
RED='\033[1;31m'
RESET='\033[0m'

ALIAS="${1:-facilitador}"
MINUTOS="${2:-150}"

if ! command -v stellar >/dev/null 2>&1; then
  echo -e "${RED}❌ No encontre el comando 'stellar'. Estas dentro del Codespace?${RESET}"
  exit 1
fi

CONTRACT_DIR="registry/mystery_exchange"
WASM_PATH="target/wasm32v1-none/release/mystery_exchange.wasm"

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

echo -e "${YELLOW}🛠  Paso 2/4 — Compilando el sorteo compartido...${RESET}"
(cd "$CONTRACT_DIR" && stellar contract build)
echo "   Compilado ✅"
echo

if [ ! -f "$WASM_PATH" ]; then
  echo -e "${RED}❌ No encontre el .wasm compilado en ${WASM_PATH}${RESET}"
  exit 1
fi

echo -e "${YELLOW}🚀 Paso 3/4 — Desplegando el sorteo en Testnet...${RESET}"
EXCHANGE_ID="$(stellar contract deploy \
  --wasm "$WASM_PATH" \
  --source-account "$ALIAS" \
  --network testnet \
  --alias "mystery_exchange")"
echo "   Desplegado ✅"
echo

UNLOCK_TIMESTAMP=$(( $(date +%s) + MINUTOS * 60 ))
echo -e "${YELLOW}⚡ Paso 4/4 — Inicializando el sorteo (se abre en ${MINUTOS} minutos)...${RESET}"
stellar contract invoke \
  --id "$EXCHANGE_ID" \
  --source-account "$ALIAS" \
  --network testnet \
  -- \
  initialize \
  --admin "$ADMIN_ADDRESS" \
  --unlock_timestamp "$UNLOCK_TIMESTAMP"
echo "   Sorteo inicializado ✅"
echo

echo -e "${GREEN}${BOLD}🎉 El sorteo compartido del taller ya esta en Testnet!${RESET}"
echo
echo -e "   ${BOLD}EXCHANGE_ID:${RESET} ${EXCHANGE_ID}"
echo -e "   ${BOLD}Se abre a las:${RESET} $(date -d "@${UNLOCK_TIMESTAMP}" 2>/dev/null || date -r "${UNLOCK_TIMESTAMP}")"
echo
echo "👉 Reparte este EXCHANGE_ID a toda la sala (chat, pizarra, etc)."
echo "   Cada participante lo pega en frontend/.env como:"
echo "   VITE_MYSTERY_EXCHANGE_CONTRACT_ID=${EXCHANGE_ID}"
echo
echo "👉 Cuando la mayoria se haya registrado (Reto 4), corre el sorteo:"
echo "   stellar contract invoke --id ${EXCHANGE_ID} --source-account ${ALIAS} --network testnet -- shuffle --admin ${ADMIN_ADDRESS}"
echo
