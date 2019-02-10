function write(...values: any) {
  console.log.apply(null, values); // tslint:disable-line
}

/**
 * Simple logger.
 */
export const log = {
  info: write,
};
