import ky from "ky";
import * as React from "react";
import { useEffect, useState } from "react";

import { SigningCosmWasmClient } from "@cosmwasm/sdk";

import { AppConfig } from "../config";
import { useError } from "./error";
import { burnerWallet, connect, Wallet } from "./sdk";

export interface ICosmWasmContext {
    readonly loading: boolean;
    readonly address: string;
    readonly getClient: () => SigningCosmWasmClient;
}

const defaultContext: ICosmWasmContext = {
    loading: true,
    address: "",
    getClient: (): SigningCosmWasmClient => { throw new Error("not yet initialized") },
};

export const CosmWasmContext = React.createContext<ICosmWasmContext>(defaultContext);

export const useSdk = () => React.useContext(CosmWasmContext);

export interface WalletProviderProps {
    config: AppConfig,
    children: any,
}

export interface SdkProviderProps {
    config: AppConfig,
    loadWallet: () => Promise<Wallet>,
    children: any,
}

export function BurnerWalletProvider(props: WalletProviderProps): JSX.Element {
    return (
        <SdkProvider config={props.config} loadWallet={burnerWallet}>
          {props.children}
        </SdkProvider>
      );    
}

export function SdkProvider(props: SdkProviderProps): JSX.Element {
    const [value, setValue] = useState(defaultContext);
    const { setError } = useError();

    const { config, loadWallet } = props;

    // just call this once on startup
    useEffect(() => {
        loadWallet()
            .then(wallet => connect(config.httpUrl, wallet))
            .then(async ({address, client}) => {
                // load from faucet if needed
                if (config.faucetUrl) {
                    const acct = await client.getAccount();
                    if (!acct?.balance?.length) {
                        console.log("Hitting faucet");
                        const result = await ky.post(config.faucetUrl, {json: {ticker: "COSM", address}});
                        console.log(result);
                    }
                }

                setValue({
                    loading: false,
                    address: address,
                    getClient: () => client,
                })
            }).catch(setError);

        // TODO: return a clean-up function???
    }, [config.httpUrl, config.faucetUrl, loadWallet, setError]);

    return (
        <CosmWasmContext.Provider value={value}>
          {props.children}
        </CosmWasmContext.Provider>
      );    
}