import { Form, Formik } from "formik";
import * as React from "react";

import { Button } from "../../theme";
import { useBaseStyles } from "../../theme";
import { FormValues } from "../Form";
import { FormTextField } from "../Form/fields/FormTextField";
import { CreatePollValidationSchema } from "../Form/validationSchema";

export const QUORUM_FIELD = "quorumField";
export const DESCRIPTION_FIELD = "descriptionField";
export const START_HEIGHT_FIELD = "startHeightField";
export const END_HEIGHT_FIELD = "endHeightField";

interface CreatePollFormProps {
  readonly loading: boolean;
  readonly handleCreatePoll: (values: FormValues) => void;
}

export interface State {
  readonly open: boolean;
}

export const CreatePollForm: React.FC<CreatePollFormProps> = ({ handleCreatePoll, loading }: CreatePollFormProps) => {
  const classes = useBaseStyles();
  const [state, setState] = React.useState<State>({ open: false });

  const handleOpen = () => {
    setState({open: true});
  };

  const handleClose = () => {
    setState({open: false});
  };

  if (state.open) {
    return (
      <Formik
        initialValues={{
            quorumField: "",
            descriptionField: "",
            startHeightField: "",
            endHeightField: "",

        }}
        validationSchema={CreatePollValidationSchema}
        onSubmit={async ({ quorumField, descriptionField, startHeightField, endHeightField }, { setSubmitting }) => {
          setSubmitting(true);
          handleCreatePoll({ quorumField, descriptionField, startHeightField, endHeightField });
          handleClose();
        }}
      >
        {({ handleSubmit }) => (
          <Form onSubmit={handleSubmit} className={classes.form}>
              <div className={classes.input}>
                <FormTextField placeholder="Quorum" name={QUORUM_FIELD} type="number" />
                <FormTextField placeholder="Secret poll" name={DESCRIPTION_FIELD} type="text" />
                <FormTextField placeholder="Start height" name={START_HEIGHT_FIELD} type="number" />
                <FormTextField placeholder="End height" name={END_HEIGHT_FIELD} type="number" />
              </div>
              <div>
                <Button type="submit" disabled={loading}>
                  Create poll
                </Button>
              </div>
          </Form>
        )}
      </Formik>
    );
  } else {
    return (
    <div>
      <Button type="submit" disabled={loading} onClick={handleOpen}>Create Poll</Button>
    </div>
    );
  }
};
