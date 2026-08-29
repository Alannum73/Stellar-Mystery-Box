import { useState } from "react";
import type { useWallet } from "../hooks/useWallet";
import type { useToken } from "../hooks/useToken";

interface MintPanelProps {
  wallet: ReturnType<typeof useWallet>;
  token: ReturnType<typeof useToken>;
}

export function MintPanel({ wallet, token }: MintPanelProps) {
  const [busy, setBusy] = useState<string | null>(null);

  async function withBusy(label: string, action: () => Promise<void>) {
    setBusy(label);
    try {
      await action();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Algo salio mal");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="card mint-panel">
      <h2>🔮 Tu moneda</h2>

      {!wallet.address ? (
        <>
          <p className="mint-panel__intro">
            Conecta tu billetera digital para ver tu moneda y usarla.
          </p>
          <button className="btn btn--primary" onClick={wallet.connect} disabled={wallet.connecting}>
            {wallet.connecting ? "Conectando..." : "🔗 Conectar mi billetera"}
          </button>
        </>
      ) : (
        <>
          <p className="mint-panel__address">
            Tu billetera: <code>{wallet.address.slice(0, 6)}...{wallet.address.slice(-6)}</code>
          </p>

          <div className="mint-panel__actions">
            <button
              className="btn"
              onClick={() => withBusy("fund", wallet.fund)}
              disabled={busy !== null}
            >
              {busy === "fund" ? "Cargando saldo..." : "🚰 Cargar saldo de prueba"}
            </button>

            {!token.alreadyMinted && (
              <button
                className="btn"
                onClick={() => withBusy("mint", token.mint)}
                disabled={busy !== null || !token.contractId}
              >
                {busy === "mint" ? "Creando..." : "✨ Crear mi moneda"}
              </button>
            )}
          </div>

          {wallet.fundedMessage && (
            <p className="mint-panel__success">✅ {wallet.fundedMessage}</p>
          )}

          {token.alreadyMinted && (
            <p className="mint-panel__success">
              ✨ Tu moneda ya fue creada (se acuño automaticamente al
              desplegarla con <code>deploy-testnet.sh</code>).
            </p>
          )}

          {!token.contractId && (
            <p className="mint-panel__warning">
              ⚠️ Todavia no configuraste tu moneda. Sigue el Reto 3 de la
              guia (<code>RETOS.md</code>) para publicarla en Stellar
              Testnet.
            </p>
          )}

          {token.name && (
            <dl className="mint-panel__stats">
              <dt>Nombre</dt>
              <dd>{token.name}</dd>
              <dt>Simbolo</dt>
              <dd>{token.symbol}</dd>
              <dt>Cuanto tienes</dt>
              <dd>{token.balance ?? "..."}</dd>
            </dl>
          )}

          {token.error && <p className="mint-panel__warning">⚠️ {token.error}</p>}
        </>
      )}
    </section>
  );
}
