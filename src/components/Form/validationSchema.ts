import * as Yup from "yup";

export const WithdrawValidationSchema = Yup.object().shape({
  withdrawAmountField: Yup.number()
    .min(0.000001, "Invalid withdraw amount"),
});

export const StakeValidationSchema = Yup.object().shape({
  stakeAmountField: Yup.number()
    .min(0.000001, "Invalid stake amount"),
});

export const CreatePollValidationSchema = Yup.object().shape({
  descriptionField: Yup.string()
    .min(3, "Min length")
    .max(64, "Max length")
    .required("Required"),
  quorumField: Yup.number()
    .min(0, "Invalid quorum")
    .max(100, "Invalid quorum")
    .required("Required"),
  startHeightField: Yup.number(),
  endHeightField: Yup.number()
});

export const CastVoteValidationSchema = Yup.object().shape({
  weightField: Yup.number()
    .min(1, "Invalid weight")
    .required("Weight required"),
});
