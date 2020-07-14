import * as React from "react";

import { useError, useSdk } from "../../service";
import { VotingDetails } from "./VotingDetails";

export interface ContractDetailsProps {
  readonly address: string;
  readonly name?: string;
}

const emptyInfo: State = {
  address: "",
  owner: "",
  stakedTokens: 0,
  pollCount: 0,
  denom: "",
};

type State = { 
  readonly address: string,
  readonly owner?: string,
  readonly stakedTokens?: number,
  readonly pollCount?: number,
  denom?: "",
};

function ContractLogic({ address }: ContractDetailsProps): JSX.Element {
  const { getClient } = useSdk();
  const { setError } = useError();
  

  const [value, setValue,] = React.useState<State>(emptyInfo);

  // get the contracts
  React.useEffect(() => {
    getClient()
      .getContract(address)
      .then(info => {
          setValue({ ...info, address})
          getClient()
          /* eslint-disable-next-line @typescript-eslint/camelcase */
          .queryContractSmart(address, { config: { } })
          .then(res => {
            setValue({ 
              address: address,
              stakedTokens: res.staked_tokens,
              pollCount: res.poll_count,
              denom: res.denom,
              })
          });
        }
      )
      .catch(setError);
  }, [setError, address, getClient]);

  return (
    <div>
      {value.denom &&
        <div>
          <VotingDetails contractAddress={address} owner={value.owner || ""} denom={value.denom} />
        </div>
      }
    </div>
  );
}

export default ContractLogic;
