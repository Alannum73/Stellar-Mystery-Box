import { useEffect } from "react";
import { useWallet } from "./hooks/useWallet";
import { useToken } from "./hooks/useToken";
import { BoxReveal } from "./components/BoxReveal";
import { MintPanel } from "./components/MintPanel";
import { ExchangePanel } from "./components/ExchangePanel";
import { SharedBoard } from "./components/SharedBoard";

export default function App() {
  const wallet = useWallet();
  const token = useToken(wallet.address);

  useEffect(() => {
    if (wallet.address) token.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet.address]);

  return (
    <div className="app">
      <header className="app__header">
        <span className="app__kicker">Expediente: amigo invisible</span>
        <h1>Stellar Mystery Box</h1>
        <p>
          Aca vas a crear tu propia moneda de juego y el sorteo va a decidir
          a quien se la mandas, sin que nadie se autoasigne.
        </p>
      </header>

      {wallet.error && <p className="mint-panel__warning app__error">⚠️ {wallet.error}</p>}

      <main className="app__grid">
        <BoxReveal />
        <MintPanel wallet={wallet} token={token} />
        <ExchangePanel wallet={wallet} token={token} />
        <SharedBoard wallet={wallet} />
      </main>

      <footer className="app__footer">
        <p>
          Estas perdido/a? Mira el archivo <code>RETOS.md</code> en la raiz
          del repositorio: ahi esta la guia completa, paso a paso.
        </p>
      </footer>
    </div>
  );
}
