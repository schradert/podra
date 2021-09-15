import { makeStyles } from "@material-ui/core/styles";
import { IconButton } from "@material-ui/core";
import { AddCircle, FilterList, Settings } from "@material-ui/icons";
import { useState } from "@hookstate/core";

const useStyles = makeStyles(() => ({
  container: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
  },
}));
export interface HeaderProps {
  filtering?: boolean;
  integrating?: boolean;
  configuring?: boolean;
}
export const Header: React.FC<HeaderProps> = ({
  filtering = false,
  integrating = false,
  configuring = false,
}: HeaderProps) => {
  const state = useState({ filtering, integrating, configuring });
  const styles = useStyles();
  return (
    <div className={styles.container} data-test-id="Header">
      <IconButton
        color={state.filtering.get() ? "secondary" : "primary"}
        onClick={() => state.filtering.set((val) => !val)}
      >
        <FilterList />
      </IconButton>
      <IconButton
        color={state.integrating.get() ? "secondary" : "primary"}
        onClick={() => state.integrating.set((val) => !val)}
      >
        <AddCircle />
      </IconButton>
      <IconButton
        color={state.configuring.get() ? "secondary" : "primary"}
        onClick={() => state.configuring.set((val) => !val)}
      >
        <Settings />
      </IconButton>
    </div>
  );
};
