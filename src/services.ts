export function fetchMockHugeData(timeout: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`
                  /**
    Tracks the current effect cancellation
    Each time the generator progresses. calling runEffect will set a new value
    on it. It allows propagating cancellation to child effects
  **/
       timeoput= ${timeout}  `+ new Date());
    }, timeout);
  });
}
