import React from 'react';
import Image from 'material-ui-image';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  image: {
    '&:hover': {
      border: '1px solid #33ffff',
      borderRadius: '10%',
      opacity: 0.3
    }
  }
}));

export interface ItemLogoProps {
  src?: string,
  width?: number,
  height?: number,
  alt?: string
}
export const ItemLogo: React.FC<ItemLogoProps> = ({ 
  src = '/favicon.ico', 
  width = 32, 
  height = 32, 
  alt = 'Logo'
}: ItemLogoProps) => {
  const styles = useStyles();
  return (
  <Image 
    className={styles.image}
    src={src as string} 
    alt={alt} 
    imageStyle={{ width, height }} />);
}
