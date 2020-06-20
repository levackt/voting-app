import { Coin, coin } from "@cosmjs/sdk38";
import MuiTypography from "@material-ui/core/Typography";
import * as React from "react";
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import TextField from '@material-ui/core/TextField';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { STAKE_AMOUNT_FIELD, StakeForm } from "./StakeForm";
import { WITHDRAW_AMOUNT_FIELD, WithdrawForm } from "./WithdrawForm";
import { useAccount, useError, useSdk } from "../../service";
// import { getAttribute } from "../../service/helpers";
import { Button, useBaseStyles } from "../../theme";
import { FormValues } from "../Form";
import { Dashboard } from "./Dashboard";
import { WEIGHT_FIELD, PollList } from "./PollList";
import { QUORUM_FIELD, DESCRIPTION_FIELD, START_HEIGHT_FIELD, END_HEIGHT_FIELD, CreatePoll } from "./CreatePoll";
import HowToVoteIcon from '@material-ui/icons/HowToVote';
import { useSnackbar, VariantType } from 'notistack';
import Grid from '@material-ui/core/Grid';
import { Instructions } from "./Instructions";
import { Loading } from "./Loading";
import Box from '@material-ui/core/Box';

export interface InitMsg {
  readonly denom?: string;
  readonly name?: string;
}

export interface CreatePollMsg {
  readonly quorum_percentage: number;
  readonly description: string;
  startHeight?: number;
  endHeight?: number;
}

export interface VotingDetailsProps {
  readonly contractAddress: string;
  readonly contract: InitMsg;
  readonly owner: string;
}

export interface State {
  readonly owner?: string;
  readonly loading: boolean;
  readonly pollCount?: number;
  readonly stakedBalance?: number;
  readonly tokenBalance?: number;
  readonly polls?: Map<number, Poll>;
}

function createPollData(pollId: number, creator: string, description: string, quorum: number, status: string) {
    const poll: Poll = {pollId, creator, description, quorum, status};
    return poll;
}

export interface Poll {
    readonly pollId: number;
    readonly vote?: string;
    readonly creator: string;
    readonly stake?: number;
    readonly description: string;
    readonly quorum: number;
    readonly blocksRemaining?: number;
    readonly result?: string;
    status?: string;
}

export function VotingDetails(props: VotingDetailsProps): JSX.Element {
  const classes = useBaseStyles();
  const { owner, contractAddress, contract } = props;
  const { address, getClient } = useSdk();
  const { setError } = useError();
  const { refreshAccount } = useAccount();
  const { enqueueSnackbar } = useSnackbar();

  const [state, setState] = React.useState<State>({ loading: false });


  React.useEffect(() => {
    setState({ loading: true});
    
    getClient()
      /* eslint-disable-next-line @typescript-eslint/camelcase */
      .queryContractSmart(contractAddress, { token_stake: { address } })
      .then(res => {
          return res
      }).then((config) => {
        getClient()
          .queryContractSmart(contractAddress, { config: { } })
          .then(res => {
            loadPolls(res.poll_count, res.staked_tokens, config.token_balance);
          })
      })
      .catch(err => {
        setState({ ...state, loading: false });
        setError(err);
      });
  }, [getClient, setError, contractAddress]);

  const doStake = async (values: FormValues): Promise<void> => {

    setState({ ...state, loading: true });
    
    const payment = [coin(parseInt(values[STAKE_AMOUNT_FIELD]) || 0, contract.denom || "")];

    try {
      await getClient().execute(
        contractAddress,
        { stake_voting_tokens: { } },
        "",
        payment,
      );
      enqueueMessage('Staked tokens', 'success');
      await refreshTokenBalance();
      refreshAccount();
      
    } catch (err) {
      setError(err);
      setState({ ...state, loading: false });
    }
  };

  const doWithdraw = async (values: FormValues): Promise<void> => {
    const amount = values[WITHDRAW_AMOUNT_FIELD] || "0";
    setState({ ...state, loading: true });

    let withdrawMsg = { withdraw_voting_tokens: { } }

    if (parseInt(amount) > 0) {
      withdrawMsg = { withdraw_voting_tokens: { amount } }
    }
    enqueueMessage('Withdrew tokens', 'success');

    try {
      await getClient().execute(
        contractAddress,
        withdrawMsg
      );
      refreshAccount();
      refreshTokenBalance();
      setState({ ...state, loading: false });
    } catch (err) {
      setError(err);
    }
  };

  const doCastVote = async (weight: number, vote: string, poll: Poll): Promise<void> => {
    let castVoteMsg = { cast_vote: { weight: String(weight), encrypted_vote: vote, poll_id: poll.pollId } }
    setState({ ...state, loading: true });
    try {
      await getClient().execute(
        contractAddress,
        castVoteMsg
      );
      enqueueMessage('Vote cast', 'success');
      
      refreshAccount();
      refreshTokenBalance();
      setState({ ...state, loading: false });
    } catch (err) {
      setError(err);
      setState({ ...state, loading: false });
    }
  };

  const doTallyPoll = async (poll: Poll): Promise<void> => {
    let tallyMsg = { end_poll: { poll_id: poll.pollId } }
    
    setState({ ...state, loading: true });
    try {
      const result = await getClient().execute(
        contractAddress,
        tallyMsg
      );
      const attributes = result.logs[0].events[1].attributes;
      let attribute = attributes.find(x => x.key === "passed");
      const passed = attribute && attribute.value === "true";
      if (!passed) {
        attribute = attributes.find(x => x.key === "rejected_reason");
        const reason = attribute && attribute.value;
        enqueueMessage(`Poll rejected: ${reason}`, 'error');
        poll.status = reason;
      } else {
        poll.status = "Passed";
        enqueueMessage('Poll passed', 'success');
      }
      
      state.polls?.set(poll.pollId, poll);
      
      refreshAccount();

      setState({ ...state, loading: false });
    } catch (err) {
      setError(err);
    }
  }

  /**
   * Refresh the user's token balance on the current contract
   */
  const refreshTokenBalance = async (): Promise<void> => {
    
    await getClient()
      /* eslint-disable-next-line @typescript-eslint/camelcase */
      .queryContractSmart(contractAddress, { token_stake: { address } })
      .then(config => {
        getClient()
          .queryContractSmart(contractAddress, { config: { } })
          .then(res => {
            loadPolls(res.poll_count, res.staked_tokens, config.token_balance);
          })
      })
      .catch(err => {
        setState({ ...state, loading: false });
        setError(err);
      });
    // await getClient()
    //     /* eslint-disable-next-line @typescript-eslint/camelcase */
    //     .queryContractSmart(contractAddress, { token_stake: { address } })
    //     .then(res => {
    //       setState({ ...state, tokenBalance: res.token_balance, loading: false });
    //     })
    //     .catch(err => {
    //       setState({ loading: false });
    //       setError(err);
    //     });
  };

  const loadPolls = async (pollCount: number, stakedBalance: number, tokenBalance: number): Promise<void> => {
    let polls: Map<number, Poll> = new Map();

    setState({ ...state, loading: true });
    
    var i: number;
    for (i = pollCount; i > 0; i--) {
        let pollId = i;
        await getClient()
        /* eslint-disable-next-line @typescript-eslint/camelcase */
          .queryContractSmart(contractAddress, { poll: { poll_id: pollId} })
          .then(res => {
              const creator = res.creator;
              const status = res.status;
              const quorum = parseInt(res.quorum_percentage);
              const description = res.description;
              
              //todo start and end height (time remaining)
              // const endHeight = res.end_height;
              // const startHeight = res.start_height;
              polls.set(pollId, createPollData(pollId, creator, description, quorum, status));
          })
          .catch(err => {
              setError(err);
          });
    }
    setState({...state, polls: polls, loading: false, stakedBalance, tokenBalance, pollCount});
    
  };

  const doCreatePoll = async (values: FormValues): Promise<void> => {
    const quorum = values[QUORUM_FIELD];
    const description = values[DESCRIPTION_FIELD];
    const startHeight = values[START_HEIGHT_FIELD];
    const endHeight = values[END_HEIGHT_FIELD];

    setState({ ...state, loading: true });

    let createMessage: CreatePollMsg = {quorum_percentage: parseInt(quorum), description}

    if (startHeight) {
      createMessage.startHeight = parseInt(startHeight);
    } 
    if (endHeight) {
      createMessage.endHeight = parseInt(endHeight);
    } 

    try {
      const result = await getClient().execute(
        props.contractAddress,
        {create_poll: createMessage}
      );
      const attribute = result.logs[0].events[1].attributes.find(x => x.key === "poll_id");
      
      if (attribute == undefined) {
        setState({ ...state, loading: false });
        // todo get error from logs
        setError("failed to create poll");
        return;
      }
      enqueueMessage('Poll created', 'success');

      const pollId: number = parseInt(attribute.value);
      await getClient()
        /* eslint-disable-next-line @typescript-eslint/camelcase */
        .queryContractSmart(contractAddress, { poll: { poll_id: pollId} })
        .then(res => {
            const creator = res.creator;
            const status = res.status;
            const quorum = parseInt(res.quorum_percentage);
            const description = res.description;

            const polls: Map<number, Poll> = state.polls || new Map();
            polls.set(pollId, createPollData(pollId, creator, description, quorum, status));
            setState({ ...state, polls: polls });
        })
        .catch(err => {
            setError(err);
        });
      // todo check if successful etc
    } catch (err) {
      setError(err);
    }

    setState({ ...state, loading: false });
  }
  function enqueueMessage(message: string, variant?: VariantType): void {
    enqueueSnackbar(message, { variant });
  }

  return (
    <Box width="100%">
      <Box width="100%" p={1} my={0.5}>
        <Instructions/>
      </Box>
      <div className={classes.card}>
        <Loading loading={state.loading}/>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            {contract.denom && 
              <Dashboard denom={contract.denom} 
                stakedBalance={state.stakedBalance} 
                tokenBalance={state.tokenBalance}
                />
            }
          </Grid>
          <Grid item xs={12}>
            <CreatePoll handleCreatePoll={doCreatePoll} loading={state.loading}/>
          </Grid>
          <Grid item xs={2}>
            <Grid container spacing={3}>

                  <MuiTypography variant="h6">
                    Token Operations:
                  </MuiTypography>
                <Grid item xs={12}>
                  <StakeForm handleStake={doStake} loading={state.loading}/>
                  <Divider />
                </Grid>
                <Grid item xs={12}>
                  <WithdrawForm handleWithdraw={doWithdraw} loading={state.loading} />
                </Grid>
            </Grid>
          </Grid>
          <Grid item xs={10}>   
            {state.polls &&
              <PollList contractAddress={contractAddress} polls={state.polls} 
                loading={state.loading} handleTallyPoll={doTallyPoll} 
                handleCastVote={doCastVote} 
                tokenBalance={state.tokenBalance}/>
            }
          </Grid>
        </Grid>

      </div>
    </Box>
  );
}
