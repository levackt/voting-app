import { FeeTable } from "@cosmjs/cosmwasm";

import { AppConfig } from "../config";

export function buildFeeTable({ feeToken, gasPrice }: AppConfig): FeeTable {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const stdFee = (gas: number, denom: string, price: number) => {
    const amount = Math.floor(gas * price);
    return {
      amount: [{ amount: amount.toString(), denom: denom }],
      gas: gas.toString(),
    };
  };

  return {
    upload: stdFee(1500000, feeToken, gasPrice),
    init: stdFee(600000, feeToken, gasPrice),
    exec: stdFee(200000, feeToken, gasPrice),
    migrate: stdFee(600000, feeToken, gasPrice),
    send: stdFee(80000, feeToken, gasPrice),
    changeAdmin: stdFee(80000, feeToken, gasPrice),
  };
}
