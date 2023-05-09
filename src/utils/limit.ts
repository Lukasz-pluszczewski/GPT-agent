export const limitWords = (str: string, limit: number) => str.split(' ').slice(0, limit).join(' ');
