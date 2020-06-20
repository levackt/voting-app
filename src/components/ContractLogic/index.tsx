import * as React from "react";

import { useError, useSdk, useAccount } from "../../service";
import { useBaseStyles } from "../../theme";
import { InitMsg, VotingDetails } from "./VotingDetails";
import { Dashboard } from "./Dashboard";
import { STAKE_AMOUNT_FIELD, StakeForm } from "./StakeForm";
import { FormValues } from "../Form";
import { Coin, coin } from "@cosmjs/sdk38";

export interface ContractDetailsProps {
  readonly address: string;
  readonly name?: string;
}

const emptyInfo: State = {
  address: "",
  owner: "",
  stakedTokens: 0,
  pollCount: 0,
  initMsg: {denom: "", name: ""},
};

type State = { 
  readonly address: string,
  readonly owner?: string,
  readonly stakedTokens?: number,
  readonly pollCount?: number,
  readonly initMsg: InitMsg,
};

function ContractLogic({ address }: ContractDetailsProps): JSX.Element {
  const classes = useBaseStyles();
  const { account } = useAccount();
  const { getClient } = useSdk();
  const { setError } = useError();
  

  const [value, setValue,] = React.useState<State>(emptyInfo);

  const doStake = async (values: FormValues): Promise<void> => {
    // setState({ owner: address, loading: true });
    
    const payment = [coin(parseInt(values[STAKE_AMOUNT_FIELD]) || 0, value.initMsg.denom || "")];

    try {
      await getClient().execute(
        value.address,
        { stake_voting_tokens: { } },
        "Staking",
        payment,
      );
      //todo query users stake

    } catch (err) {
      setError(err);
    }
  };

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
              initMsg: info.initMsg,
              })
          });
        }
      )
      .catch(setError);
  }, [setError, address, getClient]);

  return (
    <div>
      {value.initMsg && value.initMsg.denom &&
      <div>
        
        {/* <Dashboard contractAddress={address} denom={value.initMsg.denom || ""}/> */}
        <VotingDetails contractAddress={address} owner={value.owner || ""} contract={value.initMsg} />
        {/* <StakeForm handleStake={doStake} loading={false}/> */}
        {/* <WithdrawForm handleWithdraw={doWithdraw} loading={state.loading} /> */}
      </div>
      
      }
      
    </div>
  );
}

export default ContractLogic;
