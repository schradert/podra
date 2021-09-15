---
to: <%= absPath %>/index.tsx
---

import type { FC } from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  container: {
    
  }
}));
export interface <%= component_name %>Props {

}
export const <%= component_name %>: FC<<%= component_name %>Props> = ({

}: <%= component_name %>Props) => {
  const styles = useStyles();
  return (
  <div 
    className={styles.container} 
    data-test-id="<%= component_name %>" >
  
  </div>);
};