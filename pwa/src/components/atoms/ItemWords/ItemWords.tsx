import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  container: {
    width: '88%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  words: {
    margin: 0,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    display: 'inline-block',
  },
  title: {
    fontSize: '0.8rem'
  },
  subtitles: {
    fontSize: '0.7rem',
    overflow: 'hidden'
  }
}));
export interface ItemWordsProps {
  title?: string,
  author?: string,
  date?: string,
  length?: string
}
export const ItemWords: React.FC<ItemWordsProps> = ({ 
  title = '... [no title extracted] ...', 
  author = 'unknown', 
  date = (new Date()).toLocaleDateString(), 
  length = '00:05:00'
}: ItemWordsProps) => {
  const styles = useStyles();
  return (
  <div 
    className={styles.container} 
    data-testid="ItemWords" >
    <h4 className={[styles.words, styles.title].join(' ')}>{title}</h4>
    <p className={[styles.words, styles.subtitles].join(' ')}>{author}</p>
    <p className={[styles.words, styles.subtitles].join(' ')}>
      {date} &#8226; {length}
    </p>
  </div>);
};
