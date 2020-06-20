import * as React from "react";
import { coins } from "@cosmjs/sdk38";
import MuiTypography from "@material-ui/core/Typography";
import FormLabel from '@material-ui/core/FormLabel';
import { printableBalanceOf, printableAmount } from "../../service/helpers";

export interface DashboardProps {
  readonly denom: string;
  readonly tokenBalance?: number;
  readonly stakedBalance?: number;
}

export function Dashboard(props: DashboardProps): JSX.Element {
  const { denom, tokenBalance, stakedBalance } = props;
  
  return (
    <div>
      <MuiTypography variant="h6">
        Dashboard
      </MuiTypography>
      
      <FormLabel>Staked Tokens: {stakedBalance && printableAmount(denom, String(stakedBalance))}</FormLabel>
      <FormLabel>Token Balance: {tokenBalance && printableBalanceOf(denom, coins(tokenBalance, denom))}</FormLabel>
    </div>
  );
}
