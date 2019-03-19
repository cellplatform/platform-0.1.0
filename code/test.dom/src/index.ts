export * from 'jsdom';
require('jsdom-global')();

/**
 * Initializes the window/document into the `global` object on the server.
 */
export function init(options: { userAgent?: string } = {}) {
  const { userAgent = 'node.js' } = options;
  const window = global as any;
  window.navigator = { userAgent };
}

export default init;
