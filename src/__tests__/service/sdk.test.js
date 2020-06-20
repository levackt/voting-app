import { config } from "../../config";
import { signer, connect, Wallet } from "../../service/sdk";
const mnemonic =
  "economy stock theory fatal elder harbor betray wasp final emotion task crumble siren bottom lizard educate guess current outdoor pair theory focus wife stone";
const expectedAddress = "cosmos1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6";

const contract1 = {
  initMsg: {
    denom: "ucosm",
    name: "Voting contract",
  },
};

test("signing wallet", async () => {
  return signer(mnemonic).then(data => {
    const { address, signer } = data;
    expect(address).toBe(expectedAddress);
    expect(signer).not.toBeNull();
  });
});
