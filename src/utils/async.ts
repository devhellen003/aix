export const delay = (timeout: number): Promise<null> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(null), timeout);
  });

export const withTimeout = <T>(timeout: number, promise: Promise<T>): Promise<T | null> =>
  Promise.race([promise, delay(timeout)]);
