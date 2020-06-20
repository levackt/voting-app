import { Form, Formik } from "formik";
import * as React from "react";

import { Button } from "../../theme";
import { useBaseStyles } from "../../theme";
import { FormValues } from "../Form";
import { FormTextField } from "../Form/fields/FormTextField";
import { StakeValidationSchema } from "../Form/validationSchema";

export const STAKE_AMOUNT_FIELD = "stakeAmountField";

interface StakeFormProps {
  readonly loading: boolean;
  readonly handleStake: (values: FormValues) => void;
}

export const StakeForm: React.FC<StakeFormProps> = ({ handleStake, loading }: StakeFormProps) => {
  const classes = useBaseStyles();

  return (
    <Formik
      initialValues={{
        stakeAmountField: "",
      }}
      validationSchema={StakeValidationSchema}
      onSubmit={async ({ stakeAmountField }, { setSubmitting }) => {
        setSubmitting(true);
        handleStake({ stakeAmountField });
      }}
    >
      {({ handleSubmit }) => (
        <Form onSubmit={handleSubmit} className={classes.form}>
          <div className={classes.input}>
            <FormTextField placeholder="0" name={STAKE_AMOUNT_FIELD} type="text"/>
          </div>
          <div>
            <Button type="submit" disabled={loading}>
              Stake
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};
