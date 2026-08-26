// ══════════════════════════════════════════════════════════════════════
//  Helper para hablar con contratos Soroban desde el navegador, usando el
//  `contract.Client` de alto nivel de @stellar/stellar-sdk (v17): arma,
//  simula y (si hace falta) firma y envia la transaccion automaticamente,
//  leyendo el spec del contrato directamente desde su .wasm ya publicado.
//
//  Verificado contra el paquete publicado en npm el 25/08/2026. Si una
//  version mayor de @stellar/stellar-sdk cambia esta API, revisa la doc:
//  https://developers.stellar.org/docs/build/guides/transactions/invoke-contract-tx-sdk
// ══════════════════════════════════════════════════════════════════════
import { contract, Networks } from "@stellar/stellar-sdk";
import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit";

const RPC_URL = "https://soroban-testnet.stellar.org";
export const NETWORK_PASSPHRASE = Networks.TESTNET;

/** Forma minima de lo que devuelve cada metodo del Client (result + signAndSend). */
export interface AssembledCall<T> {
  result: T;
  signAndSend: () => Promise<{ result: T }>;
}

export async function getContractClient<T = unknown>(
  contractId: string,
  publicKey: string | null
) {
  return contract.Client.from<T>({
    contractId,
    networkPassphrase: NETWORK_PASSPHRASE,
    rpcUrl: RPC_URL,
    publicKey: publicKey ?? undefined,
    signTransaction: (xdr, opts) => StellarWalletsKit.signTransaction(xdr, opts),
  });
}

/** Carga saldo de prueba (XLM de Testnet) en una cuenta, usando Friendbot. */
export async function fundWithFriendbot(publicKey: string) {
  const response = await fetch(
    `https://friendbot.stellar.org/?addr=${encodeURIComponent(publicKey)}`
  );
  if (!response.ok) {
    throw new Error(
      "No pudimos cargar saldo de prueba en esta cuenta (puede que ya tenga saldo)."
    );
  }
}
