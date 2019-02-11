function write(...values: any) {
  console.log.apply(null, values); // tslint:disable-line
}

function silentWrite(...value: any) {
  return;
}

/**
 * Simple logger.
 */

export function getLog(silent?: boolean) {
  silent = silent === undefined ? false : silent;
  const writer = silent ? silentWrite : write;
  const log = {
    info: writer,
    warn: writer,
    error: writer,
  };
  return log;
}

export const log = getLog();
