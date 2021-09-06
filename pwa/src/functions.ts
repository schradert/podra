export const domainParser: (url: string) => string = 
(url: string) => {
    const regex = /([\w-]+)\.(org|com|net)/;
    const match: RegExpMatchArray | null = url.match(regex);
    if (!match) return '';
    return match[1];
};

export const capitalize: (str: string) => string = 
  (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const dateStringToNumber = (
  date: string
): number =>
  Date.parse(date);

export const dateNumberToString = (
  date: number
): string =>
  new Date(date).toISOString().substring(0, 10);

export const lengthStringToNumber = (
  length: string
): number =>
  length.split(':')
    .map((val, i) => parseInt(val)*60**(2-i))
    .reduce((sum, val) => sum += val);

export const lengthNumberToString = (
  length: number
): string => {
  const hours = length / 3600 >> 0;
  const mins = (length - (3600 * hours)) / 60 >> 0;
  const secs = (length - (3600 * hours) - (60 * mins));
  return (
    [hours, mins, secs]
      .map(val => val < 10 ? `0${val}` : val.toString())
      .join(':')
  );
};