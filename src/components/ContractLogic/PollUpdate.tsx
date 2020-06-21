import React from 'react';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import { useBaseStyles } from "../../theme";
import { Poll } from "./VotingDetails";
import IconButton from '@material-ui/core/IconButton';
import SyncIcon from '@material-ui/icons/Sync';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';

export interface PollUpdateProps {
    readonly poll: Poll;
    readonly handleTallyPoll: (poll: Poll) => void;
    readonly handleRefreshPoll: (poll: Poll) => void;
    readonly loading: boolean;
    readonly address: string;
}

export function PollUpdate(props: PollUpdateProps): JSX.Element {
    const classes = useBaseStyles();
    const { loading, address, poll, handleTallyPoll, handleRefreshPoll } = props;

    const canRefreshPoll = (poll: Poll) => {
        return !loading && poll.creator !== address && 
            poll.status === "InProgress";
    };
    const canTallyPoll = (poll: Poll) => {
        return !loading && poll.creator === address && 
            poll.status === "InProgress"
        //todo check block height etc
    };


    const pollEnded = (poll: Poll) : boolean => {
        return poll.status !== "InProgress"
    }
    const isPollCreator = (poll: Poll) : boolean => {
        return poll.creator === address;
    }

    return (
        <div>
            { canTallyPoll(poll) &&
                <IconButton
                    type="submit" onClick={(event) => handleTallyPoll(poll)}
                >
                    <AssignmentTurnedInIcon/>
                </IconButton>
            }

            { canRefreshPoll(poll) &&
                <IconButton
                    type="submit" onClick={(event) => handleRefreshPoll(poll)}
                >
                    <SyncIcon/>
                </IconButton>
            }
            { pollEnded(poll) && poll.status }
        </div>
    );
}
