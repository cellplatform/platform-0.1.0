import * as t from './types';
import { log } from './libs';

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
