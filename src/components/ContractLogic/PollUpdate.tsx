import React from 'react';
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
    readonly blockHeight: number;
}

export function PollUpdate(props: PollUpdateProps): JSX.Element {
    const { loading, address, poll, handleTallyPoll, handleRefreshPoll, blockHeight } = props;

    // non-creator can refresh polls that are in progress
    const canRefreshPoll = () => {
        return !pollExpired() && !loading && !isPollCreator() && !pollEnded();
    };

    // creator can tally polls that are in progress
    const canTallyPoll = () => {
         return pollExpired() && !loading && isPollCreator() && !pollEnded();
    };

    const pollExpired = () => {
        if (!poll.endHeight || poll.endHeight < blockHeight) {
            return true;
        }
        return false;
    }

    const pollEnded = () : boolean => {
        return poll.status !== "InProgress"
    }

    const isPollCreator = () : boolean => {
        return poll.creator === address;
    }

    return (
        <div>
            { canTallyPoll() &&
                <IconButton
                    type="submit" onClick={(event) => handleTallyPoll(poll)}
                >
                    <AssignmentTurnedInIcon/>
                </IconButton>
            }

            { canRefreshPoll() &&
                <IconButton
                    type="submit" onClick={(event) => handleRefreshPoll(poll)}
                >
                    <SyncIcon/>
                </IconButton>
            }
            { pollEnded() && poll.status }
        </div>
    );
}
