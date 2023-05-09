export const reflectPromise = <T>(cb: () => Promise<T>): Promise<readonly [T, null]> | Promise<readonly [null, Error]> => cb()
  .then(data => [data, null] as const)
  .catch(error => [null, error] as const);
