import * as React from "react";

import { useError } from "./error";
import { useSdk } from "./wallet";

interface State {
  readonly blockHeight?: number;
}

interface BlockHeightContextType extends State {
  readonly refreshBlockHeight: () => void;
}

const defaultContext: BlockHeightContextType = {
  refreshBlockHeight: () => {
    return;
  },
};

const BlockHeightContext = React.createContext<BlockHeightContextType>(defaultContext);

export const useBlockHeight = (): BlockHeightContextType => React.useContext(BlockHeightContext);

export function BlockHeightProvider({ children }: React.HTMLAttributes<HTMLOrSVGElement>): JSX.Element {
  const { setError } = useError();
  const sdk = useSdk();

  const [value, setValue] = React.useState<State>({});

  function refreshBlockHeight(): void {
    if (sdk.initialized) {
      sdk
        .getClient()
        .getHeight()
        .then(blockHeight => setValue({ blockHeight }))
        .catch(setError);
    }
  }

  // this should just be called once on startup
  React.useEffect(refreshBlockHeight, [sdk, setError]);

  const context: BlockHeightContextType = {
    refreshBlockHeight: refreshBlockHeight,
    blockHeight: value.blockHeight,
  };

  return <BlockHeightContext.Provider value={context}>{children}</BlockHeightContext.Provider>;
}
