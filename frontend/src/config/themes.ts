// Los mismos 8 temas que sugiere scripts/reveal-box.sh, para que el boton
// "Revelar mi caja" del frontend funcione sin depender de la terminal.
export interface BoxTheme {
  emoji: string;
  name: string;
  symbol: string;
  color: string;
  tagline: string;
}

export const boxThemes: BoxTheme[] = [
  { emoji: "🔥", name: "Token de Fuego", symbol: "FUE", color: "#FF5733", tagline: "Arde donde pisa" },
  { emoji: "🌊", name: "Token de Agua", symbol: "AGU", color: "#1E90FF", tagline: "Fluye siempre, no se detiene" },
  { emoji: "💨", name: "Token de Aire", symbol: "AIR", color: "#B0E0E6", tagline: "Ligero como el viento, veloz como el rayo" },
  { emoji: "🌱", name: "Token de Tierra", symbol: "TIE", color: "#6B8E23", tagline: "Crece firme, dura para siempre" },
  { emoji: "🌌", name: "Token del Cosmos", symbol: "COS", color: "#4B0082", tagline: "Viene de mas alla de las estrellas" },
  { emoji: "⚡", name: "Token del Rayo", symbol: "RAY", color: "#FFD700", tagline: "Impredecible y directo al punto" },
  { emoji: "❄️", name: "Token de Hielo", symbol: "ICE", color: "#87CEFA", tagline: "Frio por fuera, valioso por dentro" },
  { emoji: "🌑", name: "Token de Sombra", symbol: "SOM", color: "#2F2F4F", tagline: "Se mueve donde nadie lo ve" },
];

export function pickRandomTheme(): BoxTheme {
  return boxThemes[Math.floor(Math.random() * boxThemes.length)];
}
