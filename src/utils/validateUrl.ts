export const validateUrl = (url: string): boolean => {
  const urlPattern: RegExp = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
  return urlPattern.test(url);
};
