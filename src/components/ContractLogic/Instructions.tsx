import React from 'react';
import { useBaseStyles } from "../../theme";
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MuiTypography from "@material-ui/core/Typography";
import HowToVoteIcon from '@material-ui/icons/HowToVote';
import Link from "@material-ui/core/Link";

export interface InstructionsProps {
}

export function Instructions(props: InstructionsProps): JSX.Element {
  const classes = useBaseStyles();
  
  return (
    <div>
      <ExpansionPanel className={classes.instructions}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="instructions-content"
          id="instructions-header"
        >
          <MuiTypography variant="h6">
            Instructions
          </MuiTypography>
          <HowToVoteIcon/>

        </ExpansionPanelSummary>
        <ExpansionPanelDetails >
          <Typography>
            Welcome to Privote, a privacy-first voting app on Secret Network. 
            <br></br>
            This platform allows users to create pools with parameters like participation threshold (quorum) and vote duration. 
            <br></br>
            Once a pool is created, any participant can stake SCRT to vote on the pool in a privacy-preserving manner. 
            <br></br>
            This means users can prove they voted, but their vote will remain encrypted. Secret voting is critical for mitigating bribery attacks. 
            <br></br>
            For more on secret voting and why you should care, please read our blog post (TBD)
            <br></br>
            <Link href="https://learn.scrt.network/questions.html">
              Secret Network FAQ
            </Link>
          </Typography>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </div>
  );
}
