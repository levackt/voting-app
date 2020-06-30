#!/usr/bin/env node

/* eslint-disable @typescript-eslint/camelcase */
const { SigningCosmWasmClient } = require("@cosmjs/cosmwasm");

const { Secp256k1Pen, coins } = require("@cosmjs/sdk38");
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
  createPollMsg: {
    description: "test poll",
    start_height: 100,
    end_height: 10000
  },
};

const contract2 = {
  initMsg: {
    denom: "ustake",
    name: "another voting contract",
  },
  createPollMsg: {
    quorum: 10,
    description: "another poll",
    start_height: 100,
    end_height: 10000
  },
};

const customFees = {
  upload: {
    amount: coins(25000, "ucosm"),
    gas: "2000000", // two million
  },
  init: {
    amount: coins(12500, "ucosm"),
    gas: "500000", // 500k
  },
  exec: {
    amount: coins(5000, "ucosm"),
    gas: "200000", // 200k
  },
  send: {
    amount: coins(2000, "ucosm"),
    gas: "80000", // 80k
  },
};

async function main() {
  
  const pen = await Secp256k1Pen.fromMnemonic(faucet.mnemonic);
  const client = new SigningCosmWasmClient(httpUrl, faucet.address, signBytes => pen.sign(signBytes), customFees);

  const wasm = fs.readFileSync(__dirname + "/../contracts/contract.wasm");
  const uploadReceipt = await client.upload(wasm, codeMeta, "Voting code");
  console.info(`Upload succeeded. Receipt: ${JSON.stringify(uploadReceipt)}`);

  for (const { initMsg, createPollMsg} of [contract1, contract2]) {
  // for (const { initMsg, createPollMsg } of [contract1]) {
    const memo = `Create a voting instance "${initMsg.name}"`;
    const { contractAddress } = await client.instantiate(uploadReceipt.codeId, initMsg, initMsg.name, memo);
    console.info(`Contract "${initMsg.name}" instantiated at ${contractAddress}`);

    console.info(`Creating poll : "${createPollMsg.description}"`);

    const result = await client.execute(
      contractAddress, {create_poll: createPollMsg}
    );
    console.info(`Result: ${JSON.stringify(result)}`)

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
