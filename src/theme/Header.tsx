import { Account } from "@cosmjs/sdk38";
import { AppBar, IconButton, Toolbar } from "@material-ui/core";
import MuiTypography from "@material-ui/core/Typography";
import useScrollTrigger from "@material-ui/core/useScrollTrigger";
import { ArrowBack } from "@material-ui/icons";
import * as React from "react";
import { Link } from "react-router-dom";
import { useBaseStyles } from "./styles";

import { printableBalance } from "../service/helpers";
import { BlockHeight } from "./BlockHeight";

interface ElevationScrollProps {
  readonly children: any;
}

function ElevationScroll(props: ElevationScrollProps): JSX.Element {
  const { children } = props;
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
    //   target: window ? window() : undefined,
  });

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
  });
}

export interface HeaderProps {
  readonly account?: Account;
  readonly address?: String;
  children?: React.ReactElement;
}

// Show the current account or any error message in the header
export function Header({ account, address, children }: HeaderProps, props: any): JSX.Element {
    const balance = account ? printableBalance(account.balance) : (<span>
          (No funds - Go get some{" "}
          <a
            href="https://faucet.pub.testnet.enigma.co"
            rel="noopener noreferrer"
            target="_blank"
          >
            from the faucet
          </a>
          )
      </span>);
  const classes = useBaseStyles();

  return (
    <React.Fragment>
      <ElevationScroll {...props}>
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar>
            <Link to="/" className={classes.account}>
              <IconButton edge="start" color="inherit">
                <ArrowBack />
              </IconButton>
            </Link>
            <MuiTypography variant="h6">
              {address} - {balance}
            </MuiTypography>
            <BlockHeight/>
          </Toolbar>
        </AppBar>
      </ElevationScroll>
      <Toolbar />
    </React.Fragment>
  );
}
