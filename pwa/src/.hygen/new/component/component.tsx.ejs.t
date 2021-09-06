---
to: <%= absPath %>/<%= component_name %>.tsx
---

import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  container: {
    
  }
}));
export interface <%= component_name %>Props {

}
export const <%= component_name %>: React.FC<<%= component_name %>Props> = ({

}: <%= component_name %>Props) => {
  const styles = useStyles();
  return (
  <div 
    className={styles.container} 
    data-testid="<%= component_name %>" >
  
  </div>);
};