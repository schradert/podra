import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
    IconButton,
    Icon,
    Modal,
    Backdrop,
    Fade,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from "@material-ui/core";
import { CheckCircleOutline, ErrorOutline, AddBox } from "@material-ui/icons";
import {
    redditIntegration,
    twitterIntegration,
} from "../../scripts/integrations";
import { metaState, AppState } from "../../App";
import { useState } from "@hookstate/core";

const useStyles = makeStyles((theme) => ({
    modal: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    paper: {
        backgroundColor: "#DB81FF",
        border: "2px solid black",
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
    table: {
        width: 300,
    },
}));
export const IntegrationModal: React.FC = () => {
    const appState = useState<AppState>(metaState);
    const styles = useStyles();

    const triggerIntegration = (service: string) => (): void => {
        switch (service) {
            case "reddit":
                redditIntegration();
                break;
            case "twitter":
                twitterIntegration();
                break;
        }
    };

    return (
        <Modal
            data-test-id="IntegrationModel"
            className={styles.modal}
            open={appState.integrating.get()}
            onClose={() => appState.integrating.set(false)}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{ timeout: 500 }}
        >
            <Fade in={appState.integrating.get()}>
                <div className={styles.paper}>
                    <TableContainer component={Paper}>
                        <Table className={styles.table}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Service</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {appState.services.map((row) => (
                                    <TableRow key={row.name.get()}>
                                        <TableCell component="th" scope="row">
                                            <Icon>
                                                <img
                                                    src={`/svg/${row.name.get()}.svg`}
                                                />
                                            </Icon>
                                        </TableCell>
                                        <TableCell align="center">
                                            {
                                                {
                                                    ["Enabled" as string]: (
                                                        <Icon color="action">
                                                            <CheckCircleOutline />
                                                        </Icon>
                                                    ),
                                                    ["Error" as string]: (
                                                        <Icon color="error">
                                                            <ErrorOutline />
                                                        </Icon>
                                                    ),
                                                    ["Disabled" as string]: (
                                                        <IconButton
                                                            disableRipple
                                                            color="primary"
                                                            onClick={triggerIntegration(
                                                                row.name.get()
                                                            )}
                                                        >
                                                            <AddBox />
                                                        </IconButton>
                                                    ),
                                                }[row.status.get()]
                                            }
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            </Fade>
        </Modal>
    );
};
