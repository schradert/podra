import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Icon } from '@material-ui/core';
import { useAuth } from '../../../App';
import firebase from '../../../firebase';

const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyItems: 'center'
  }
}));

export const GoogleAuth: React.FC = () => {
  const auth = useAuth();
  const styles = useStyles();

  const login = () => {
    chrome.identity.getAuthToken({ interactive: true }, token => {
      const credential = firebase.auth.GoogleAuthProvider.credential(null, token);
      firebase.auth().signInWithCredential(credential);
      auth.token.set(token);
    });
  }

  return (
  <div 
    className={styles.container} 
    data-testid="GoogleAuth" >
    <Button 
      startIcon={<Icon>google</Icon>}
      variant="contained"
      onClick={login}>
      Signin
    </Button>
  </div>);
};