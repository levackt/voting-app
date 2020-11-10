#!/usr/bin/env node

/* eslint-disable @typescript-eslint/camelcase */
const { Encoding } = require("@iov/encoding");
const { coin } = require("@cosmjs/sdk38");

/* eslint-disable @typescript-eslint/camelcase */
const { BroadcastMode, EnigmaUtils, Secp256k1Pen, SigningCosmWasmClient, pubkeyToAddress, encodeSecp256k1Pubkey, makeSignBytes } = require("secretjs");
const { Slip10RawIndex } = require("@iov/crypto");
const fs = require("fs");

const httpUrl = "https://bootstrap.secrettestnet.io";
// const httpUrl = "http://localhost:1317";
const faucet = {
  mnemonic:
    "economy stock theory fatal elder harbor betray wasp final emotion task crumble siren bottom lizard educate guess current outdoor pair theory focus wife stone",
    address: "secret1cdycaskx8g9gh9zpa5g8ah04ql0lzkrsxmcnfq",
};

// upload code and docs
const codeMeta = {
  source:  "https://github.com/levackt/cosmwasm-examples/tree/secret/voting",
  builder: "enigmampc/secret-contract-optimizer:1.0.3",
};

const createPollMsg = {
  description: "Voting should be secret",
  quorum_percentage: 0,
};

const initMsg = {
  denom: "uscrt",
  name: "Privote test",
};

const contract1 = {
  initMsg,
  createPollMsg
};

const customFees = {
  upload: {
    amount: [{ amount: "2000000", denom: "uscrt" }],
    gas: "2000000",
  },
  init: {
    amount: [{ amount: "500000", denom: "uscrt" }],
    gas: "500000",
  },
  exec: {
    amount: [{ amount: "250000", denom: "uscrt" }],
    gas: "250000",
  },
  send: {
    amount: [{ amount: "80000", denom: "uscrt" }],
    gas: "80000",
  },
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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
  console.log(myWalletAddress)
  const wasm = fs.readFileSync(__dirname + "/../contracts/contract.wasm");
  const uploadReceipt = await client.upload(wasm, { 
    source: codeMeta.source, 
    builder: codeMeta.builder
  });
  console.info(`Upload succeeded. Receipt: ${JSON.stringify(uploadReceipt)}`);

  const codeId = uploadReceipt.codeId;

  for (const { initMsg, createPollMsg} of [contract1]) {
    const memo = `Create a voting instance "${initMsg.name}"`;
    const { contractAddress } = await client.instantiate(codeId, initMsg, initMsg.name);
    console.info(`Contract "${initMsg.name}" instantiated at ${contractAddress}`);
    let response = await client.getBlock()
    console.info(`Block height=${JSON.stringify(response.header.height)}`)
    
    let height = response.header.height
    const pollEnd = height + 5;


    console.info(`Creating poll : "${JSON.stringify(createPollMsg)}"`);

    let result = await client.execute(
      contractAddress, {create_poll: createPollMsg}
    );
    
    console.info(`Create poll result: ${JSON.stringify(result)}`)

    const config = await client.queryContractSmart(contractAddress, { config: { } })
    console.log(`config=${JSON.stringify(config)}`)
    const pollId = config.poll_count;

    const denom = "uscrt";
    const amount = 1000000
    const stake = [coin(amount, denom)];

    const currentStake = await client.queryContractSmart(contractAddress, { token_stake: { address: myWalletAddress } })
    console.log(`stake=${JSON.stringify(currentStake)}`)
    if (parseInt(currentStake.token_balance) === 0) {
        
      result = await client.execute(contractAddress,
        { stake_voting_tokens: { } }, "", stake,
      );
      console.info(`Stake result: ${JSON.stringify(result)}`)
    }
    
    const yay = "yes";
    const nay = "nay";
    result = await client.execute(
      contractAddress, { cast_vote: { weight: String(amount), vote: yay, poll_id: pollId } }
    )
    console.info(`Vote result: ${JSON.stringify(result)}`)

    // wait for poll to end then tally
    response = await client.getBlock()
    console.info(`Block height=${JSON.stringify(response.header.height)}`)
    while (height < pollEnd) {
      console.info("waiting for new block")
      await sleep(1000)
      response = await client.getBlock();
      height = response.header.height
    }
    console.info("poll expired")

    let tallyMsg = { end_poll: { poll_id: pollId } }
    result = await client.execute(contractAddress, tallyMsg, "");
    
    console.info(`Tally result: ${JSON.stringify(result)}`)

    const poll = await client.queryContractSmart(contractAddress, { poll: { poll_id: pollId } })
    console.info(`${poll}`)
  }
}

main().then(
  () => {
    console.info("Done deploying voting instance");
    process.exit(0);
  },
  error => {
    console.error(error);
    process.exit(1);
  },
);
