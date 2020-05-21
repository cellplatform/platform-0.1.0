const sort = require('toposort'); // eslint-disable-line

/**
 * Topologically sort directed acyclic graph.
 * https://github.com/marcelklehr/toposort
 */
export function toposort<T extends string | number>(graph: T[][]): T[] {
  return sort(graph);
}
