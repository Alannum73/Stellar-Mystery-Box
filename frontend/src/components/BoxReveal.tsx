import { useEffect, useState } from "react";
import { tokenConfig } from "../config/tokenConfig";
import { pickRandomTheme, type BoxTheme } from "../config/themes";

const STORAGE_KEY = "stellar-mystery-box:theme";

export function BoxReveal() {
  const [theme, setTheme] = useState<BoxTheme | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setTheme(JSON.parse(saved));
    } catch {
      // sin almacenamiento local disponible, no pasa nada
    }
  }, []);

  function reveal() {
    const next = pickRandomTheme();
    setTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // si no se puede guardar, la caja igual se revela en pantalla
    }
  }

  const accentColor = theme?.color ?? tokenConfig.color;

  return (
    <section
      className="card box-reveal"
      style={{
        borderColor: accentColor,
        boxShadow: `6px 6px 0 0 ${accentColor}`,
      }}
    >
      {!theme ? (
        <>
          <div className="box-reveal__emoji">🎁</div>
          <h2>Tu Caja Misteriosa</h2>
          <p className="box-reveal__hint">
            Todavia no la abriste. Haz clic para descubrir el tema de tu
            caja.
          </p>
          <button className="btn btn--primary" onClick={reveal}>
            🎲 Revelar mi caja
          </button>
        </>
      ) : (
        <>
          <div className="box-reveal__emoji">{theme.emoji}</div>
          <h2>{theme.name}</h2>
          <p className="box-reveal__tagline">"{theme.tagline}"</p>

          <dl className="box-reveal__stats">
            <dt>Simbolo sugerido</dt>
            <dd>{theme.symbol}</dd>
            <dt>Color sugerido</dt>
            <dd>{theme.color}</dd>
          </dl>

          <p className="box-reveal__hint">
            Copia estos valores en el bloque RETO 1 de{" "}
            <code>contracts/mystery_token/src/lib.rs</code>, o inventa los
            tuyos, la caja es tuya.
          </p>

          <button className="btn" onClick={reveal}>
            🎲 Probar otro tema
          </button>
        </>
      )}
    </section>
  );
}
