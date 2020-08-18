import { Coin } from "@cosmjs/launchpad";
import { Decimal } from "@cosmjs/math";

// NARROW NO-BREAK SPACE (U+202F)
const thinSpace = "\u202F";

export function printableBalanceOf(denom: string, balance?: readonly Coin[]): string {
  if (!balance || balance.length === 0) return "–";
  const coin = balance.filter(coin => coin.denom === denom).map(printableCoin);
  return coin.length > 0 ? coin[0] : "";
}

export function printableBalance(balance?: readonly Coin[]): string {
  if (!balance || balance.length === 0) return "–";
  return balance.map(printableCoin).join(", ");
}

export function printableCoin(coin?: Coin): string {
  if (!coin) {
    return "0";
  }
  return printableAmount(coin.denom, coin.amount);
}

export function printableAmount(denom: string, amount: string): string {
  if (!amount) {
    return "0";
  }
  if (denom.startsWith("u")) {
    const ticker = denom.slice(1).toUpperCase();
    return Decimal.fromAtomics(amount, 6).toString() + thinSpace + ticker;
  } else {
    return amount + thinSpace + denom;
  }
}

// export function getAttribute (logs: readonly logs.Log[], key: string): string|undefined {
//   const key = logs[0].events[1].attributes.find(x => x.key === key);
//   return logs[0].events[0].attributes.find(x => x.key === key)?.value
// }
