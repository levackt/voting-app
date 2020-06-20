#!/usr/bin/env node

/* eslint-disable @typescript-eslint/camelcase */
const { SigningCosmWasmClient } = require("@cosmjs/cosmwasm");

const { Secp256k1Pen } = require("@cosmjs/sdk38");
const fs = require("fs");

const httpUrl = "http://localhost:1317";
const faucet = {
  mnemonic:
    "economy stock theory fatal elder harbor betray wasp final emotion task crumble siren bottom lizard educate guess current outdoor pair theory focus wife stone",
  address: "cosmos1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
};

// todo upload code and docs
const codeMeta = {
  source: "https://crates.io/api/v1/crates/cd-voting/0.4.0/download",
  builder: "confio/cosmwasm-opt:0.8.0",
};

const contract1 = {
  initMsg: {
    denom: "ucosm",
    name: "voting contract",
  },
};

const contract2 = {
  initMsg: {
    denom: "ustake",
    name: "another voting contract",
  },
};

const withdrawMsg = {
  handleMsg: {
    amount: 1,
  },
};

async function main() {
  const pen = await Secp256k1Pen.fromMnemonic(faucet.mnemonic);
  const client = new SigningCosmWasmClient(httpUrl, faucet.address, signBytes => pen.sign(signBytes));

  const wasm = fs.readFileSync(__dirname + "/../contracts/contract.wasm");
  const uploadReceipt = await client.upload(wasm, codeMeta, "Voting code");
  console.info(`Upload succeeded. Receipt: ${JSON.stringify(uploadReceipt)}`);

  for (const { initMsg } of [contract1, contract2]) {
    const memo = `Create a voting instance "${initMsg.name}"`;
    const { contractAddress } = await client.instantiate(uploadReceipt.codeId, initMsg, initMsg.name, memo);
    console.info(`Contract "${initMsg.name}" instantiated at ${contractAddress}`);


  }
}

main().then(
  () => {
    console.info("Done deploying voting instances.");
    process.exit(0);
  },
  error => {
    console.error(error);
    process.exit(1);
  },
);
