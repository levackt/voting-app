import React, { useEffect } from 'react';
import { Poll } from "./VotingDetails";
import IconButton from '@material-ui/core/IconButton';
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

    useEffect(() => {
        const interval = setInterval(() => {
            handleRefreshPoll(poll)
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // creator can tally polls that are in progress
    const canTallyPoll = () => {
         return pollExpired() && !loading && isPollCreator() && pollInProgress();
    };

    const pollExpired = () => {
        if (!poll.endHeight || poll.endHeight < blockHeight) {
            return true;
        }
        return false;
    }

    const pollInProgress = () : boolean => {
        return poll.status === "InProgress"
    }

    const isPollCreator = () : boolean => {
        return poll.creator === address;
    }

    return (
        <div>
            { pollInProgress() &&
                <IconButton
                    type="submit" disabled={!canTallyPoll()}
                    onClick={(event) => handleTallyPoll(poll)}
                > 
                    <AssignmentTurnedInIcon/> Tally
                </IconButton>
            }
        </div>
    );
}
