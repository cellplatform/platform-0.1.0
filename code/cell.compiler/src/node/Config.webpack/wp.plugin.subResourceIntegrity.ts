import { SubresourceIntegrityPlugin } from 'webpack-subresource-integrity';

import * as t from './types';

/**
 * Plugin: webpack-subresource-integrity
 *         https://github.com/waysact/webpack-subresource-integrity/tree/main/webpack-subresource-integrity
 *
 * Context:
 *        https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity
 *
 *      From MDN documentation:
 *        Subresource Integrity (SRI) is a security feature that enables browsers to
 *        verify that resources they fetch (for example, from a CDN) are delivered without
 *        unexpected manipulation. It works by allowing you to provide a cryptographic hash
 *        that a fetched resource must match.
 */
export function init(args: t.PluginArgs) {
  /**
   * TODO 🐷
   */
  console.log('webpack-subresource-integrity');

  // return new SubresourceIntegrityPlugin();
}
