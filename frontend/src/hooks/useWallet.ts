// ══════════════════════════════════════════════════════════════════════
//  Conexion con Freighter via @creit.tech/stellar-wallets-kit (API v2,
//  estatica, verificada contra el paquete publicado en npm el 25/08/2026).
//
//  Nota: esta libreria reescribio su API por completo entre versiones
//  mayores. Si algo de aca no compila con la version instalada, revisa
//  la documentacion oficial: https://stellarwalletskit.dev/
// ══════════════════════════════════════════════════════════════════════
import { useCallback, useEffect, useState } from "react";
import { StellarWalletsKit, Networks } from "@creit.tech/stellar-wallets-kit";
import { FreighterModule, FREIGHTER_ID } from "@creit.tech/stellar-wallets-kit/modules/freighter";
import { fundWithFriendbot } from "../lib/soroban";

let kitInitialized = false;

function ensureKitInitialized() {
  if (kitInitialized) return;
  StellarWalletsKit.init({
    modules: [new FreighterModule()],
    selectedWalletId: FREIGHTER_ID,
    network: Networks.TESTNET,
  });
  kitInitialized = true;
}

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [funding, setFunding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ensureKitInitialized();
    // Si ya habia una billetera conectada de antes, la recuperamos.
    StellarWalletsKit.getAddress()
      .then(({ address: existing }) => setAddress(existing ?? null))
      .catch(() => {
        /* nadie conectado todavia, no pasa nada */
      });
  }, []);

  const connect = useCallback(async () => {
    ensureKitInitialized();
    setError(null);
    setConnecting(true);
    try {
      const { address: connected } = await StellarWalletsKit.authModal();
      setAddress(connected);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No pudimos conectar tu billetera. Revisa que tengas instalada la extension Freighter en tu navegador."
      );
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    await StellarWalletsKit.disconnect();
    setAddress(null);
  }, []);

  const fund = useCallback(async () => {
    if (!address) return;
    setFunding(true);
    setError(null);
    try {
      await fundWithFriendbot(address);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No pudimos cargar el saldo de prueba. Intenta de nuevo en unos segundos."
      );
    } finally {
      setFunding(false);
    }
  }, [address]);

  const signTransaction = useCallback(
    async (xdr: string) => {
      if (!address) throw new Error("Conecta tu billetera primero");
      const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
        address,
        networkPassphrase: Networks.TESTNET,
      });
      return signedTxXdr;
    },
    [address]
  );

  return {
    address,
    connecting,
    funding,
    error,
    connect,
    disconnect,
    fund,
    signTransaction,
  };
}
