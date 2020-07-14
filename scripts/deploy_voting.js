#!/usr/bin/env node

/* eslint-disable @typescript-eslint/camelcase */
const { EnigmaUtils, Secp256k1Pen, SigningCosmWasmClient, pubkeyToAddress, encodeSecp256k1Pubkey } = require("secretjs");
const fs = require("fs");

const httpUrl = "http://localhost:1317";
const faucet = {
  mnemonic:
    "economy stock theory fatal elder harbor betray wasp final emotion task crumble siren bottom lizard educate guess current outdoor pair theory focus wife stone",
  address: "secret1cdycaskx8g9gh9zpa5g8ah04ql0lzkrsxmcnfq",
};

// todo upload code and docs
const codeMeta = {
  source: "https://crates.io/api/v1/crates/cd-voting/0.4.0/download",
  builder: "confio/cosmwasm-opt:0.8.0",
};

const contract1 = {
  initMsg: {
    denom: "uscrt",
    name: "voting contract",
  },
  createPollMsg: {
    description: "test poll",
    start_height: 100,
    end_height: 10000
  },
};

const customFees = {
  upload: {
    amount: [{ amount: "25000", denom: "uscrt" }],
    gas: "2000000",
  },
  init: {
    amount: [{ amount: "0", denom: "uscrt" }],
    gas: "500000",
  },
  exec: {
    amount: [{ amount: "0", denom: "uscrt" }],
    gas: "500000",
  },
  send: {
    amount: [{ amount: "2000", denom: "uscrt" }],
    gas: "80000",
  },
};

async function main() {

  const signingPen = await Secp256k1Pen.fromMnemonic(faucet.mnemonic);
  const myWalletAddress = pubkeyToAddress(
    encodeSecp256k1Pubkey(signingPen.pubkey),
    "secret"
  );
  const txEncryptionSeed = EnigmaUtils.GenerateNewSeed();
  const client = new SigningCosmWasmClient(
    httpUrl,
    myWalletAddress,
    (signBytes) => signingPen.sign(signBytes),
    txEncryptionSeed, customFees
  );
  
  const wasm = fs.readFileSync(__dirname + "/../contracts/contract.wasm");
  const uploadReceipt = await client.upload(wasm, codeMeta, "Voting code");
  console.info(`Upload succeeded. Receipt: ${JSON.stringify(uploadReceipt)}`);

  // for (const { initMsg, createPollMsg} of [contract1, contract2]) {
  for (const { initMsg, createPollMsg } of [contract1]) {
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
