import { useEffect, useState } from "react";
import type { useWallet } from "../hooks/useWallet";
import { useToken } from "../hooks/useToken";
import { useRegistry } from "../hooks/useRegistry";

interface MintPanelProps {
  wallet: ReturnType<typeof useWallet>;
}

export function MintPanel({ wallet }: MintPanelProps) {
  const token = useToken(wallet.address);
  const registry = useRegistry(wallet.address);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (wallet.address) {
      token.refresh();
      registry.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet.address]);

  const alreadyRegistered = registry.tokens.some(
    (t) => t.contract_id === token.contractId
  );

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

            <button
              className="btn"
              onClick={() => withBusy("mint", token.mint)}
              disabled={busy !== null || !token.contractId}
            >
              {busy === "mint" ? "Creando..." : "✨ Crear mi moneda"}
            </button>

            <button
              className="btn btn--primary"
              onClick={() =>
                withBusy("register", () =>
                  registry.register(
                    token.contractId ?? "",
                    token.name ?? "Mi Token",
                    token.symbol ?? "XXX"
                  )
                )
              }
              disabled={busy !== null || !token.contractId || alreadyRegistered}
            >
              {alreadyRegistered
                ? "⭐ Ya la sume al tablero"
                : busy === "register"
                  ? "Sumando..."
                  : "⭐ Sumarme al tablero"}
            </button>
          </div>

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
