import { SigningCosmWasmClient } from "@cosmjs/cosmwasm";
import { OfflineSigner } from "@cosmjs/launchpad";
import * as React from "react";
import { useEffect, useState } from "react";

import { AppConfig } from "../config";
import { createClient, loadOrCreateWallet } from "./sdk";

interface CosmWasmContextType {
  readonly initialized: boolean;
  readonly address: string;
  readonly getClient: () => SigningCosmWasmClient;
}

const defaultContext: CosmWasmContextType = {
  initialized: false,
  address: "",
  getClient: (): SigningCosmWasmClient => {
    throw new Error("not yet initialized");
  },
};

const CosmWasmContext = React.createContext<CosmWasmContextType>(defaultContext);

export const useSdk = (): CosmWasmContextType => React.useContext(CosmWasmContext);

interface ConfigProp {
  readonly config: AppConfig;
}

type BurnerWalletProviderProps = ConfigProp & React.HTMLAttributes<HTMLOrSVGElement>;

export function BurnerWalletProvider({ config, children }: BurnerWalletProviderProps): JSX.Element {
  return (
    <SdkProvider config={config} loadWallet={loadOrCreateWallet}>
      {children}
    </SdkProvider>
  );
}

interface ConfigWalletProps extends ConfigProp {
  readonly loadWallet: (addressPrefix: string) => Promise<OfflineSigner>;
}

type SdkProviderProps = ConfigWalletProps & React.HTMLAttributes<HTMLOrSVGElement>;

export function SdkProvider({ config, loadWallet, children }: SdkProviderProps): JSX.Element {
  const [value, setValue] = useState(defaultContext);

  useEffect(() => {
    loadWallet(config.addressPrefix)
      .then(signer => createClient(config.httpUrl, signer))
      .then(async client => {
        const address = client.senderAddress;
        // load from faucet if needed
        if (config.faucetUrl) {
          const acct = await client.getAccount();
          if (!acct?.balance?.length) {
            await fetch(config.faucetUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ticker: config.faucetToken, address }),
            });
          }
        }

        setValue({
          initialized: true,
          address: address,
          getClient: () => client,
        });
      });
  }, [config.addressPrefix, config.faucetToken, config.faucetUrl, config.httpUrl, loadWallet]);

  return <CosmWasmContext.Provider value={value}>{children}</CosmWasmContext.Provider>;
}
