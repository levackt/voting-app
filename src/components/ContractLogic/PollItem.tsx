import React from 'react';
import { useBaseStyles } from "../../theme";
import IconButton from '@material-ui/core/IconButton';
import { useSdk } from "../../service";
import { withStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import ThumbDownIcon from "@material-ui/icons/ThumbDown";
import { Poll } from "./VotingDetails";
import { TextField } from "@material-ui/core";
import { PollUpdate } from "./PollUpdate";

export const WEIGHT_FIELD = "weightField";


const StyledTableCell = withStyles((theme) => ({
  head: {
      fontSize: 15,
      fontWeight: "bold"
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

export interface PollItemProps {
  readonly contractAddress: string;
  readonly poll: Poll;
  readonly loading: boolean;
  readonly blockHeight: number;
  readonly stakedBalance: number;
  readonly handleCastVote: (vote: string, poll: Poll, weight: number) => void;
  readonly handleTallyPoll: (poll: Poll) => void;
  readonly handleRefreshPoll: (poll: Poll) => void;
}

const StyledTableRow = withStyles((theme) => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);

export interface State {
    pollWeight?: number;
}

export function PollItem(props: PollItemProps): JSX.Element {
  const classes = useBaseStyles();
  const { address } = useSdk();
  const { handleCastVote, handleTallyPoll, handleRefreshPoll, 
    loading, poll, blockHeight, stakedBalance } = props;
  const [state, setState] = React.useState<State>({ });

  const handleYesVote = () => {
      const vote = "yes";
      if (validWeight() && !pollExpired() && state.pollWeight) {
        handleCastVote(vote, poll, state.pollWeight);
      }
  };

  const handleNoVote = () => {
      const vote = "no";
      if (validWeight() && !pollExpired() && state.pollWeight) {
        handleCastVote(vote, poll, state.pollWeight);
      }
  };

  const pollExpired = () => {
    if (!poll.endHeight) {
      return false;
    } else if (poll.endHeight <= blockHeight) {
      return true;
    }
    return false;
  }

  const timeRemaining = () => {
      if (poll.endHeight) {

        const blocksRemaining = poll.endHeight - blockHeight;

        if (blocksRemaining > 0) {
          const blockTime = 1; // todo block time
          const seconds = blocksRemaining * blockTime;
          const d = Math.floor(seconds / (3600*24));
          const h = Math.floor(seconds % (3600*24) / 3600);
          const m = Math.floor(seconds % 3600 / 60);
          const s = Math.floor(seconds % 60);

          if (d > 0) {
            return `~${d} days ${h}h`;
          } else {
            return `${h}h ${m}m ${s}s`;
          }
        } else {
          poll.status = "Expired"
        }
      }
  }

  const validWeight = () => {
    if (!stakedBalance || !state.pollWeight) {
      return false;
    } else {
      return state.pollWeight <= stakedBalance
    }
  }

  const canCastVote = () => {
    const pollWeight = state.pollWeight;
    if (!pollExpired() && pollWeight && poll.status === "InProgress") {
        return true;
    } else {
        return false;
    }
  };

  const handleWeightChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) : void => {
      event.preventDefault();
      const weight = event.target.value;
      
      if (weight && parseInt(weight) > 0 && parseInt(weight) <= stakedBalance) {
        setState({pollWeight: parseInt(weight)});
      }
  }

  return (
    <StyledTableRow key={poll.pollId}>
        <StyledTableCell>
            <IconButton disabled={!canCastVote()}
            color="primary" onClick={handleYesVote} aria-label="Yea">
                <ThumbUpIcon/>
            </IconButton>
            <IconButton disabled={!canCastVote()}
                color="secondary" onClick={handleNoVote} aria-label="Nay">
                <ThumbDownIcon/>
            </IconButton>
        </StyledTableCell>
        <StyledTableCell size="small" align="left">
            <TextField className={classes.pollInput} 
                name={WEIGHT_FIELD} type="number" 
                disabled={poll.status !== "InProgress"}
                onChange={(event) => handleWeightChange(event)}/>
        </StyledTableCell>
        <StyledTableCell align="left" component="th" scope="row">
            {poll.description}
        </StyledTableCell>
        <StyledTableCell align="right">{poll.quorum || 0}</StyledTableCell>
        <StyledTableCell align="right">{timeRemaining()}</StyledTableCell>
        <StyledTableCell align="right">
            <PollUpdate address={address} handleTallyPoll={handleTallyPoll} blockHeight={blockHeight}
            loading={loading} handleRefreshPoll={handleRefreshPoll} poll={poll}
            />
        </StyledTableCell>
    </StyledTableRow>
  );
}