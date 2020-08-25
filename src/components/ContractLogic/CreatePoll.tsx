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
            <Button type="submit" disabled={loading} 
                onClick={handleClickOpen}>Create New Poll</Button>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle className={classes.createPollTitle} id="form-dialog-title">Create New Poll</DialogTitle>
                <DialogContent className={classes.createPollDialog}>
                    <Formik
                        initialValues={{
                            quorumField: "0",
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
                        <Form onSubmit={handleSubmit} className={classes.createPollForm}>
                            <div className={classes.createPollInput}>
                                <Grid container direction={"row"}>
                                    <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <FormTextField placeholder="" name={QUORUM_FIELD} type="number" required={false} disabled={true}/>
                                        }
                                        label="Quorum"
                                        labelPlacement="end"
                                    />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            control={
                                                <FormTextField placeholder="" name={DESCRIPTION_FIELD} type="text" required={true}/>
                                            }
                                            label="Description"
                                            labelPlacement="end"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            control={
                                                <FormTextField placeholder="" name={START_HEIGHT_FIELD} type="number" />
                                            }
                                            label="Start height"
                                            labelPlacement="end"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            control={
                                                <FormTextField placeholder="" name={END_HEIGHT_FIELD} type="number" />
                                            }
                                            label="End height"
                                            labelPlacement="end"
                                        />
                                    </Grid>
                                    
                                    <Grid item xs={5}>
                                        <Button type="reset" onClick={handleClose}>
                                            Cancel
                                        </Button>
                                    </Grid>
                                    <Grid item xs={5}>
                                        <Button type="submit" disabled={loading}>
                                            Create
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
