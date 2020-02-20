export * from './constants.paths';

/**
 * Allow special non-standard custom namespaces for desktop.
 */
import { Schema } from './libs';
Schema.uri.ALLOW.NS = [...Schema.uri.ALLOW.NS, 'sys*'];

export const HOST = 'http://localhost:8080';
export const URI = {
  UI_FILES: 'cell:sys!A1',
};
