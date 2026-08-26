import { useWallet } from "./hooks/useWallet";
import { BoxReveal } from "./components/BoxReveal";
import { MintPanel } from "./components/MintPanel";
import { SharedBoard } from "./components/SharedBoard";

export default function App() {
  const wallet = useWallet();

  return (
    <div className="app">
      <header className="app__header">
        <span className="app__kicker">Expediente: caja misteriosa</span>
        <h1>Stellar Mystery Box</h1>
        <p>
          Aca vas a crear tu propia moneda de juego, darle un poder
          secreto y mostrarla junto a las de toda la sala, en vivo.
        </p>
      </header>

      {wallet.error && <p className="mint-panel__warning app__error">⚠️ {wallet.error}</p>}

      <main className="app__grid">
        <BoxReveal />
        <MintPanel wallet={wallet} />
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
