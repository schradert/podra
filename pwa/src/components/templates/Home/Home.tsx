import React from 'react';
import {
  makeStyles, 
  fade 
} from '@material-ui/core/styles';
import { ItemList } from '../../molecules';
import {
  FilterSorterBox,
  Header,
  IntegrationModal
} from '../../organisms';
import { useState } from '@hookstate/core';
import { 
  AppState, 
  featureState, 
  FeatureState, 
  metaState
} from '../../../App';

const useStyles = makeStyles(theme => ({
  background: {
    width: 500,
    height: 500,
    backgroundColor: '#DB81FF',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'stretch',
    alignItems: 'center',
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
      width: 'auto'
    }
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  inputRoot: {
    color: 'inherit'
  },
  inputInput: {
    padding: theme.spacing(1,1,1,0),
    paddingLeft: `calc(1m + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch'
    }
  },

}));



export const Home: React.FC = () => {
  const state = useState<FeatureState>(featureState);
  const appState = useState<AppState>(metaState);
  const styles = useStyles();

  return (
  <div className={styles.background}>
    <Header
      filtering={appState.filtering.get()} 
      integrating={appState.integrating.get()}
      configuring={appState.configuring.get()} />
    {appState.filtering.get() && <FilterSorterBox />}
    <IntegrationModal />
    <ItemList 
      list={state.results.get()} 
      filters={state.features.map(feat => feat.filter.get())} 
      sort={state.features.map(feat => ({
        name: feat.filter.name.get(),
        direction: feat.direction.get() as SortOrder
      }))} />
  </div>);
};

/*
React.useEffect(
  () => {
    const db = firebase.firestore();
    const SERVICES: ServiceType[] = [];
    db.collection("services").get()
      .then(services => services.forEach(service => {
        SERVICES.push({ name: service.get('name'), status: 'Disabled' });
      }))
      .catch(err => console.log('Firestore Services Retrieval Error: ', err));
    appState.services.set(SERVICES);
    const key = '[BrowserShelf] Chrome Bookmark IDs: Search';
    chrome.storage.local.get(key,
      items => chrome.bookmarks.get(items[key], results => {
        state.results.set(results.map(item => ({
          url: item.url,
          logo: {
            src: `https://${domainParser(item.url as string)}.com/favicon.ico`,
          },
          words: {
            title: item.title,
            author: 'unknown',
            date: '01-31-2020',
            length: '00:05:00',
          }
        })));
      })
    )
    return () => console.log('Bookmarks loaded into React!');
  }, []
);*/
