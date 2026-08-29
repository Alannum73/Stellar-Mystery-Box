/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MYSTERY_EXCHANGE_CONTRACT_ID: string;
  readonly VITE_MYSTERY_TOKEN_CONTRACT_ID: string;
  readonly VITE_NETWORK: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
