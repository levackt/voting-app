import React, { useEffect } from 'react';
import { useBaseStyles } from "../../theme";
import { useBlockHeight } from "../../service";
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { Poll } from "./VotingDetails";
import { PollItem } from "./PollItem";

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
  readonly stakedBalance: number;
  readonly polls: Map<number, Poll>;
  readonly loading: boolean;
  readonly handleCastVote: (vote: string, poll: Poll, weight: number) => void;
  readonly handleTallyPoll: (poll: Poll) => void;
  readonly handleRefreshPoll: (poll: Poll) => void;
}

export function PollList(props: PollListProps): JSX.Element {
  const classes = useBaseStyles();
  const { blockHeight, refreshBlockHeight } = useBlockHeight();
  const { handleCastVote, handleTallyPoll, handleRefreshPoll, loading, polls, contractAddress, stakedBalance } = props;

  // refresh the block height, do this less frequently in real life
  useEffect(() => {
    const interval = setInterval(() => {
      refreshBlockHeight();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
      <div>
        <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="List of polls">
            <TableHead>
            <TableRow>
                <StyledTableCell>Vote</StyledTableCell>
                <StyledTableCell align="left">Weight</StyledTableCell>
                <StyledTableCell align="left">Description</StyledTableCell>
                <StyledTableCell align="right">Quorum</StyledTableCell>
                <StyledTableCell align="right">Time remaining</StyledTableCell>
                <StyledTableCell align="right">Status</StyledTableCell>
                <StyledTableCell align="right"></StyledTableCell>
            </TableRow>
            </TableHead>
            <TableBody>
                {Array.from(polls.values()).map((poll: Poll) => (
                  <PollItem stakedBalance={stakedBalance}
                    contractAddress={contractAddress} 
                    poll={poll} loading={loading}
                    handleCastVote={handleCastVote} 
                    handleRefreshPoll={handleRefreshPoll}
                    handleTallyPoll={handleTallyPoll} 
                    blockHeight={blockHeight || 0}/>
                ))}
            </TableBody>
        </Table>
        </TableContainer>
    </div>
  );
}