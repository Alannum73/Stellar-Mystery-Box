#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
#  🎁 reveal-box.sh — Reto 0: revela el tema de tu caja misteriosa
#
#  Elige un tema al azar y te sugiere los valores para personalizar
#  tu token en el Reto 1. NO modifica ningun archivo, tu editas a
#  mano contracts/mystery_token/src/lib.rs para que el commit sea tuyo.
# ═══════════════════════════════════════════════════════════════════
set -euo pipefail

BOLD='\033[1m'
YELLOW='\033[1;33m'
CYAN='\033[1;36m'
GREEN='\033[1;32m'
RESET='\033[0m'

# Cada tema: emoji|nombre_sugerido|simbolo_sugerido|color|lema
TEMAS=(
  "🔥|Token de Fuego|FUE|#FF5733|Arde donde pisa"
  "🌊|Token de Agua|AGU|#1E90FF|Fluye siempre, no se detiene"
  "💨|Token de Aire|AIR|#B0E0E6|Ligero como el viento, veloz como el rayo"
  "🌱|Token de Tierra|TIE|#6B8E23|Crece firme, dura para siempre"
  "🌌|Token del Cosmos|COS|#4B0082|Viene de mas alla de las estrellas"
  "⚡|Token del Rayo|RAY|#FFD700|Impredecible y directo al punto"
  "❄️|Token de Hielo|ICE|#87CEFA|Frio por fuera, valioso por dentro"
  "🌑|Token de Sombra|SOM|#2F2F4F|Se mueve donde nadie lo ve"
)

INDICE=$((RANDOM % ${#TEMAS[@]}))
IFS='|' read -r EMOJI NOMBRE SIMBOLO COLOR LEMA <<< "${TEMAS[$INDICE]}"

clear

# El ancho del recuadro se calcula solo, en vez de contar espacios a mano,
# para que el borde quede siempre alineado sin importar el terminal. El
# emoji queda afuera del recuadro porque en varios terminales no mide
# exactamente 1 columna de ancho y desalinearia el borde.
TEXTO_BANNER="ABRIENDO TU CAJA MISTERIOSA..."
ANCHO_BANNER=$(( ${#TEXTO_BANNER} + 10 ))
RELLENO_IZQ=$(( (ANCHO_BANNER - ${#TEXTO_BANNER}) / 2 ))
RELLENO_DER=$(( ANCHO_BANNER - ${#TEXTO_BANNER} - RELLENO_IZQ ))
BORDE=$(printf '─%.0s' $(seq 1 "$ANCHO_BANNER"))
ESPACIOS=$(printf ' %.0s' $(seq 1 "$ANCHO_BANNER"))

echo -e "${YELLOW}"
echo "   🎁"
echo "   ┌${BORDE}┐"
echo "   │${ESPACIOS}│"
printf "   │%*s%s%*s│\n" "$RELLENO_IZQ" "" "$TEXTO_BANNER" "$RELLENO_DER" ""
echo "   │${ESPACIOS}│"
echo "   └${BORDE}┘"
echo -e "${RESET}"
sleep 1

echo -e "${CYAN}${BOLD}✨ Tu caja se abrio! Adentro encontraste:${RESET}"
echo
echo -e "   ${BOLD}Tema:${RESET}      ${EMOJI}  ${NOMBRE}"
echo -e "   ${BOLD}Simbolo:${RESET}   ${SIMBOLO}"
echo -e "   ${BOLD}Color:${RESET}     ${COLOR}"
echo -e "   ${BOLD}Lema:${RESET}      \"${LEMA}\""
echo
echo -e "${GREEN}${BOLD}👉 Ahora ve al Reto 1:${RESET}"
echo "   Abre contracts/mystery_token/src/lib.rs y cambia:"
echo
echo "   const TOKEN_NAME: &str = \"${NOMBRE}\";"
echo "   const TOKEN_SYMBOL: &str = \"${SIMBOLO}\";"
echo
echo "   (Puedes usar estos valores tal cual, o inventar los tuyos,"
echo "   la caja es tuya!)"
echo
echo "   Tambien puedes editar frontend/src/config/tokenConfig.ts"
echo "   con el emoji ${EMOJI}, el color ${COLOR} y el lema \"${LEMA}\"."
echo
echo "Cuando termines de editar, guarda tu avance con:"
echo -e "${BOLD}   git add . && git commit -m \"Reto 1: mi token\" && git push${RESET}"
echo
