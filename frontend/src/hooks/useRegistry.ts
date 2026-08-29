import { useCallback, useState } from "react";
import { getContractClient, type AssembledCall } from "../lib/soroban";
import { tokenConfig } from "../config/tokenConfig";

const EXCHANGE_CONTRACT_ID = import.meta.env.VITE_MYSTERY_EXCHANGE_CONTRACT_ID as
  | string
  | undefined;

export interface BoxEntry {
  owner: string;
  token_contract: string;
  name: string;
  symbol: string;
  emoji: string;
  tagline: string;
}

// Firma del contrato mystery_exchange, tal como quedo en
// registry/mystery_exchange/src/lib.rs (sin el parametro `env`).
interface MysteryExchangeContract {
  register: (args: {
    owner: string;
    token_contract: string;
    name: string;
    symbol: string;
    emoji: string;
    tagline: string;
  }) => Promise<AssembledCall<null>>;
  list: () => Promise<AssembledCall<BoxEntry[]>>;
  is_shuffled: () => Promise<AssembledCall<boolean>>;
  unlock_timestamp: () => Promise<AssembledCall<bigint>>;
  my_match: (args: { caller: string }) => Promise<AssembledCall<BoxEntry>>;
  my_admirer: (args: { caller: string }) => Promise<AssembledCall<BoxEntry>>;
}

export function useRegistry(publicKey: string | null) {
  const [tokens, setTokens] = useState<BoxEntry[]>([]);
  const [shuffled, setShuffled] = useState(false);
  const [unlockTimestamp, setUnlockTimestamp] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!publicKey || !EXCHANGE_CONTRACT_ID) return;
    setLoading(true);
    setError(null);
    try {
      const client = await getContractClient<MysteryExchangeContract>(
        EXCHANGE_CONTRACT_ID,
        publicKey
      );
      const [listTx, shuffledTx, unlockTx] = await Promise.all([
        client.list(),
        client.is_shuffled(),
        client.unlock_timestamp(),
      ]);
      setTokens(listTx.result);
      setShuffled(shuffledTx.result);
      setUnlockTimestamp(Number(unlockTx.result));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No pudimos leer el sorteo compartido"
      );
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  const register = useCallback(
    async (tokenContractId: string, name: string, symbol: string) => {
      if (!publicKey) throw new Error("Conecta tu billetera primero");
      if (!EXCHANGE_CONTRACT_ID) {
        throw new Error(
          "El sorteo compartido todavia no esta conectado. Pregunta a quien organiza el taller."
        );
      }
      const client = await getContractClient<MysteryExchangeContract>(
        EXCHANGE_CONTRACT_ID,
        publicKey
      );
      const tx = await client.register({
        owner: publicKey,
        token_contract: tokenContractId,
        name,
        symbol,
        emoji: tokenConfig.emoji,
        tagline: tokenConfig.tagline,
      });
      await tx.signAndSend();
      await refresh();
    },
    [publicKey, refresh]
  );

  /** A quien le tengo que mandar mi caja. Null si todavia no se sorteo. */
  const getMyMatch = useCallback(async (): Promise<BoxEntry | null> => {
    if (!publicKey || !EXCHANGE_CONTRACT_ID) return null;
    try {
      const client = await getContractClient<MysteryExchangeContract>(
        EXCHANGE_CONTRACT_ID,
        publicKey
      );
      const tx = await client.my_match({ caller: publicKey });
      return tx.result;
    } catch {
      return null;
    }
  }, [publicKey]);

  /** Quien me manda la caja a mi. Null si todavia no llega el momento de abrir. */
  const getMyAdmirer = useCallback(async (): Promise<BoxEntry | null> => {
    if (!publicKey || !EXCHANGE_CONTRACT_ID) return null;
    try {
      const client = await getContractClient<MysteryExchangeContract>(
        EXCHANGE_CONTRACT_ID,
        publicKey
      );
      const tx = await client.my_admirer({ caller: publicKey });
      return tx.result;
    } catch {
      return null;
    }
  }, [publicKey]);

  return {
    registryId: EXCHANGE_CONTRACT_ID ?? null,
    tokens,
    shuffled,
    unlockTimestamp,
    loading,
    error,
    refresh,
    register,
    getMyMatch,
    getMyAdmirer,
  };
}
