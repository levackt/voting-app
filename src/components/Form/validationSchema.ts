import * as Yup from "yup";

//todo delete
export const TransferValidationSchema = Yup.object().shape({
  addressField: Yup.string()
    .min(45, "Address invalid")
    .required("An address is required"),
});

export const WithdrawValidationSchema = Yup.object().shape({
  amountField: Yup.string()
    .min(0, "Invalid withdraw amount"),
});

export const StakeValidationSchema = Yup.object().shape({
  amountField: Yup.string()
    .min(1, "Invalid stake amount"),
});

export const CreatePollValidationSchema = Yup.object().shape({
  descriptionField: Yup.string()
    .min(3, "Description invalid")
    .max(64, "Description invalid")
    .required("Description is required"),
  quorumField: Yup.string()
    .min(0, "Invalid quorum")
    .max(100, "Invalid quorum")
    .required("Quorum is required"),
});

export const CastVoteValidationSchema = Yup.object().shape({
  weightField: Yup.string()
    .min(1, "Invalid weight")
    .required("Weight is required"),
});
