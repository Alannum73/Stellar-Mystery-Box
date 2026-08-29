#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
#  🎲 join-exchange.sh — Reto 4: sumate al sorteo compartido
#
#  Uso: pnpm run register <tu-alias> <TOKEN_ID> <EXCHANGE_ID>
#       (o: ./scripts/join-exchange.sh <tu-alias> <TOKEN_ID> <EXCHANGE_ID>)
#
#  TOKEN_ID    = el CONTRACT_ID que te imprimio deploy-testnet.sh
#  EXCHANGE_ID = el EXCHANGE_ID que te dio el facilitador
# ═══════════════════════════════════════════════════════════════════
set -euo pipefail

BOLD='\033[1m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
RED='\033[1;31m'
RESET='\033[0m'

ALIAS="${1:-}"
TOKEN_ID="${2:-}"
EXCHANGE_ID="${3:-}"

if [ -z "$ALIAS" ] || [ -z "$TOKEN_ID" ] || [ -z "$EXCHANGE_ID" ]; then
  echo -e "${RED}❌ Faltan datos.${RESET}"
  echo "   Uso: ./scripts/join-exchange.sh <tu-alias> <TOKEN_ID> <EXCHANGE_ID>"
  exit 1
fi

if ! command -v stellar >/dev/null 2>&1; then
  echo -e "${RED}❌ No encontre el comando 'stellar'. Estas dentro del Codespace?${RESET}"
  exit 1
fi

OWNER_ADDRESS="$(stellar keys address "$ALIAS")"

echo -e "${YELLOW}🔎 Leyendo el nombre y simbolo de tu token desplegado...${RESET}"
TOKEN_NAME="$(stellar contract invoke --id "$TOKEN_ID" --source-account "$ALIAS" --network testnet -- name | tr -d '"')"
TOKEN_SYMBOL="$(stellar contract invoke --id "$TOKEN_ID" --source-account "$ALIAS" --network testnet -- symbol | tr -d '"')"
echo "   Nombre: ${TOKEN_NAME}"
echo "   Simbolo: ${TOKEN_SYMBOL}"
echo

read -rp "🎨 Que emoji representa a tu caja? (Enter = 🎁): " EMOJI
EMOJI="${EMOJI:-🎁}"

read -rp "💬 Cual es el lema de tu token? (Enter = 'Un token con historia'): " TAGLINE
TAGLINE="${TAGLINE:-Un token con historia}"

echo
echo -e "${YELLOW}🎲 Sumandote al sorteo compartido...${RESET}"
stellar contract invoke \
  --id "$EXCHANGE_ID" \
  --source-account "$ALIAS" \
  --network testnet \
  -- \
  register \
  --owner "$OWNER_ADDRESS" \
  --token_contract "$TOKEN_ID" \
  --name "$TOKEN_NAME" \
  --symbol "$TOKEN_SYMBOL" \
  --emoji "$EMOJI" \
  --tagline "$TAGLINE"

echo
echo -e "${GREEN}${BOLD}🎉 Ya estas anotado en el sorteo!${RESET}"
echo
echo "👉 Proximos pasos del Reto 4:"
echo "   1. Espera a que quien organiza el taller dispare el sorteo."
echo "   2. En el frontend, vas a ver a quien le tienes que mandar tu caja"
echo "      y vas a poder enviarla con el boton 'Enviar mi caja'."
echo "   3. Cuando llegue el momento, vas a ver quien te mando la tuya."
echo "   4. Busca tu contrato en Stellar Expert:"
echo "      https://stellar.expert/explorer/testnet/contract/${TOKEN_ID}"
echo "   5. Completa MI-TOKEN.md con ese link y tu comprobante."
echo "   6. Guarda tu avance:"
echo -e "${BOLD}      git add . && git commit -m \"Reto 4: en el sorteo\" && git push${RESET}"
echo
