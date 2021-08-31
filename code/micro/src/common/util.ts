import * as t from './types';
import { log } from './libs';

/**
 * HTTP method as log color.
 */
export function methodColor(method: t.HttpMethod) {
  switch (method) {
    case 'GET':
      return log.magenta;
    case 'PUT':
    case 'POST':
    case 'PATCH':
      return log.green;
    case 'DELETE':
      return log.yellow;

    default:
      throw new Error(`HTTP method '${method}' not supported.`);
  }
}

/**
 * Converts a port into usable numbers.
 */
export function parsePort(input: number | string) {
  if (typeof input === 'number') {
    return { internal: input, external: input };
  }

  const parts = input
    .trim()
    .split(':')
    .map((part) => part.trim())
    .filter((part) => Boolean(part))
    .reverse();

  const ERR = `Invalid port string. Should be <external> => <internal>, eg "8080:1234". Given "${input}".`;

  if (parts.length > 2) {
    throw new Error(ERR);
  }

  try {
    const internal = parseInt(parts[0], 10);
    const external = parseInt(parts[1], 10) || internal;
    return { internal, external };
  } catch (error: any) {
    throw new Error(`${ERR} ${error.message}`);
  }
}
