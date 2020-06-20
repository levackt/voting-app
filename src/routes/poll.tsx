import React from "react";
import { useParams } from "react-router";

import ContractLogic from "../components/ContractLogic";

function PollDetails(): JSX.Element {
  const { address, pollId } = useParams();

  return <div>test name</div>
  // return <ContractLogic address={address || ""} pollId={pollId} />;
}

export default PollDetails;
