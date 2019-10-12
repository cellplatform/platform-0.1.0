const sort = require('toposort');

/**
 * Topologically sort directed acyclic graph.
 * https://github.com/marcelklehr/toposort
 */
export function toposort<T extends string | number>(graph: T[][]): T[] {
  return sort(graph);
}
