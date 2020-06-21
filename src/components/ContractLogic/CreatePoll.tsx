import { Form, Formik } from "formik";
import * as React from "react";

import { Button } from "../../theme";
import { useBaseStyles } from "../../theme";
import { FormValues } from "../Form";
import { FormTextField } from "../Form/fields/FormTextField";
import { CreatePollValidationSchema } from "../Form/validationSchema";
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Tooltip from "@material-ui/core/Tooltip";

export const QUORUM_FIELD = "quorumField";
export const DESCRIPTION_FIELD = "descriptionField";
export const START_HEIGHT_FIELD = "startHeightField";
export const END_HEIGHT_FIELD = "endHeightField";

interface CreatePollProps {
  readonly loading: boolean;
  readonly handleCreatePoll: (values: FormValues) => void;
}

export const CreatePoll: React.FC<CreatePollProps> = ({ handleCreatePoll, loading }: CreatePollProps) => {
  const classes = useBaseStyles();
  const [open, setOpen] = React.useState(false);
  
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

    return (
        <div>
            <Button type="submit" disabled={loading} onClick={handleClickOpen}>Create New Poll</Button>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">Create New Poll</DialogTitle>
                <DialogContent>
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
                                <Grid>
                                    <Grid item xs={12}>
                                        <FormTextField placeholder="Quorum" name={QUORUM_FIELD} type="number" />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormTextField placeholder="Secret poll" name={DESCRIPTION_FIELD} type="text" />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormTextField placeholder="Start height" name={START_HEIGHT_FIELD} type="number" />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormTextField placeholder="End height" name={END_HEIGHT_FIELD} type="number" />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button onClick={handleClose}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={loading}>
                                            Create poll
                                        </Button>
                                    </Grid>

                                </Grid>
                                </div>
                        </Form>
                        )}
                    </Formik>
                </DialogContent>
            </Dialog>
        </div>
    );
  }
