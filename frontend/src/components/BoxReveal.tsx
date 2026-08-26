import { tokenConfig } from "../config/tokenConfig";

export function BoxReveal() {
  return (
    <section
      className="card box-reveal"
      style={{
        borderColor: tokenConfig.color,
        boxShadow: `6px 6px 0 0 ${tokenConfig.color}`,
      }}
    >
      <div className="box-reveal__emoji">{tokenConfig.emoji}</div>
      <h2>Tu Caja Misteriosa</h2>
      <p className="box-reveal__tagline">"{tokenConfig.tagline}"</p>
      <p className="box-reveal__hint">
        Todavia no la abriste? Escribe <code>pnpm run reveal</code> en la
        terminal para descubrir el tema de tu caja.
      </p>
    </section>
  );
}
