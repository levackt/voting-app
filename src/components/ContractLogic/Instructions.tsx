import React from 'react';
import { useBaseStyles } from "../../theme";
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MuiTypography from "@material-ui/core/Typography";
import HowToVoteIcon from '@material-ui/icons/HowToVote';

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
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
            sit amet blandit leo lobortis eget.
          </Typography>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </div>
  );
}
