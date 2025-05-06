export function fetchMockHugeData(timeout: number=1000) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`currentTime:  ${timeout}  `+ new Date());
    }, timeout);
  });
}
