import { useCallback, useState } from "react";
import { getContractClient, type AssembledCall } from "../lib/soroban";
import { tokenConfig } from "../config/tokenConfig";

const REGISTRY_CONTRACT_ID = import.meta.env.VITE_TOKEN_REGISTRY_CONTRACT_ID as
  | string
  | undefined;

export interface RegisteredToken {
  contract_id: string;
  name: string;
  symbol: string;
  owner: string;
  emoji: string;
  tagline: string;
}

// Firma del contrato token_registry, tal como quedo en
// registry/token_registry/src/lib.rs (sin el parametro `env`).
interface TokenRegistryContract {
  register: (args: {
    token_contract: string;
    name: string;
    symbol: string;
    emoji: string;
    tagline: string;
    owner: string;
  }) => Promise<AssembledCall<null>>;
  list: () => Promise<AssembledCall<RegisteredToken[]>>;
}

export function useRegistry(publicKey: string | null) {
  const [tokens, setTokens] = useState<RegisteredToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!publicKey || !REGISTRY_CONTRACT_ID) return;
    setLoading(true);
    setError(null);
    try {
      const client = await getContractClient<TokenRegistryContract>(
        REGISTRY_CONTRACT_ID,
        publicKey
      );
      const tx = await client.list();
      setTokens(tx.result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No pudimos leer el tablero compartido"
      );
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  const register = useCallback(
    async (tokenContractId: string, name: string, symbol: string) => {
      if (!publicKey) throw new Error("Conecta tu billetera primero");
      if (!REGISTRY_CONTRACT_ID) {
        throw new Error(
          "El tablero compartido todavia no esta conectado. Pregunta a quien organiza el taller."
        );
      }
      const client = await getContractClient<TokenRegistryContract>(
        REGISTRY_CONTRACT_ID,
        publicKey
      );
      const tx = await client.register({
        token_contract: tokenContractId,
        name,
        symbol,
        emoji: tokenConfig.emoji,
        tagline: tokenConfig.tagline,
        owner: publicKey,
      });
      await tx.signAndSend();
      await refresh();
    },
    [publicKey, refresh]
  );

  return {
    registryId: REGISTRY_CONTRACT_ID ?? null,
    tokens,
    loading,
    error,
    refresh,
    register,
  };
}
