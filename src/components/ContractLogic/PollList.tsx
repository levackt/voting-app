import * as React from "react";
import { Button, useBaseStyles } from "../../theme";
import IconButton from '@material-ui/core/IconButton';
import MuiTypography from "@material-ui/core/Typography";
import { useAccount, useError, useSdk } from "../../service";
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';
import Paper from '@material-ui/core/Paper';
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import ThumbDownIcon from "@material-ui/icons/ThumbDown";
import { Poll } from "./VotingDetails";
import SyncIcon from '@material-ui/icons/Sync';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
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

export interface PollListProps {
  readonly contractAddress: string;
  readonly polls: Map<number, Poll>;
  readonly loading: boolean;
  readonly handleCastVote: (weight: number, vote: string, poll: Poll) => void;
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
    // pollId to weight
    pollWeightMap: Map<number, number>;
}

export function PollList(props: PollListProps): JSX.Element {
  const classes = useBaseStyles();
  const { account } = useAccount();
  const { address, getClient } = useSdk();
  const { handleCastVote, handleTallyPoll, handleRefreshPoll, loading, polls } = props;
  const [state, setState] = React.useState<State>({ pollWeightMap: new Map<number, number>() });

  const handleYesVote = (poll: Poll) => {
      const weight = state.pollWeightMap.get(poll.pollId) || 0;
      const vote = "yes";
      handleCastVote(weight, vote, poll);
  };

  const handleNoVote = (poll: Poll) => {
      const weight = state.pollWeightMap.get(poll.pollId) || 0;
      const vote = "no";
      handleCastVote(weight, vote, poll);
  };

  // const canTallyPoll = (poll: Poll) => {
  //     return !loading && poll.creator === address && 
  //       poll.status === "InProgress"
  //     //todo check block height etc
  // };

  const canCastVote = (poll: Poll) => {
      const pollWeightMap = state.pollWeightMap;
      if (pollWeightMap !== undefined && 
            pollWeightMap.get(poll.pollId) !== undefined &&
            poll.status === "InProgress") {
          return true;
      } else {
          return false;
      }
      //todo check block height, already voted etc
  };

  const handleWeightChange = (pollId: number, 
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) : void => {
      event.preventDefault();
      const weight = event.target.value;
      let pollWeightMap = state.pollWeightMap;

      if (weight && parseInt(weight) > 0) {
        pollWeightMap.set(pollId, parseInt(weight));
      } else {
          pollWeightMap.delete(pollId);
      }
      setState({pollWeightMap});
  }

  const pollEnded = (poll: Poll) : boolean => {
    return poll.status !== "InProgress"
  }

  const pollInProgress = (poll: Poll) : boolean => {
    return poll.status === "InProgress"
  }

  return (
      <div>
        <TableContainer component={Paper} className={classes.polls}>
        <Table className={classes.table} aria-label="List of polls">
            <TableHead>
            <TableRow>
                <StyledTableCell>Vote</StyledTableCell>
                <StyledTableCell align="left">Weight</StyledTableCell>
                <StyledTableCell align="right">Description</StyledTableCell>
                <StyledTableCell align="right">Quorum</StyledTableCell>
                <StyledTableCell align="right">Time remaining</StyledTableCell>
                <StyledTableCell align="right"></StyledTableCell>
            </TableRow>
            </TableHead>
            <TableBody>
                {Array.from(polls.values()).map((poll: Poll) => (
                    <StyledTableRow key={poll.pollId}>
                        <StyledTableCell>
                            <IconButton disabled={!canCastVote(poll)}
                            color="inherit" onClick={(event) => handleYesVote(poll)} aria-label="Yea">
                                <ThumbUpIcon/>
                            </IconButton>
                            <IconButton disabled={!canCastVote(poll)}
                                color="inherit" onClick={(event) => handleNoVote(poll)} aria-label="Nay">
                                <ThumbDownIcon/>
                            </IconButton>
                        </StyledTableCell>
                        <StyledTableCell size="small" align="left">
                            <TextField className={classes.pollInput} 
                                name={WEIGHT_FIELD} type="number" 
                                disabled={poll.status !== "InProgress"}
                                onChange={(event) => handleWeightChange(poll.pollId, event)}/>
                        </StyledTableCell>
                        <StyledTableCell align="right" component="th" scope="row">
                            {poll.description}
                        </StyledTableCell>
                        <StyledTableCell align="right">{poll.quorum}</StyledTableCell>
                        <StyledTableCell align="right"></StyledTableCell>
                        <StyledTableCell align="right">
                          <PollUpdate address={address} handleTallyPoll={handleTallyPoll}
                            loading={loading} handleRefreshPoll={handleRefreshPoll} poll={poll}
                          />
                        </StyledTableCell>
                    </StyledTableRow>
                ))}
            </TableBody>
        </Table>
        </TableContainer>
    </div>
  );
}