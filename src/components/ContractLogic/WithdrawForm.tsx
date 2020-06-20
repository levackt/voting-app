import { Form, Formik } from "formik";
import * as React from "react";

import { Button } from "../../theme";
import { useBaseStyles } from "../../theme";
import { FormValues } from "../Form";
import { FormTextField } from "../Form/fields/FormTextField";
import { WithdrawValidationSchema } from "../Form/validationSchema";

export const WITHDRAW_AMOUNT_FIELD = "withdrawAmountField";

interface WithdrawFormProps {
  readonly loading: boolean;
  readonly handleWithdraw: (values: FormValues) => void;
}

export const WithdrawForm: React.FC<WithdrawFormProps> = ({ handleWithdraw, loading }: WithdrawFormProps) => {
  const classes = useBaseStyles();

  return (
    <Formik
      initialValues={{
        withdrawAmountField: "",
      }}
      validationSchema={WithdrawValidationSchema}
      onSubmit={async ({ withdrawAmountField }, { setSubmitting }) => {
        setSubmitting(true);
        handleWithdraw({ withdrawAmountField });
      }}
    >
      {({ handleSubmit }) => (
        <Form onSubmit={handleSubmit} className={classes.form}>
          <div className={classes.input}>
            <FormTextField placeholder="0" name={WITHDRAW_AMOUNT_FIELD} type="text" />
          </div>
          <div>
            <Button type="submit" disabled={loading}>
              Withdraw
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};
