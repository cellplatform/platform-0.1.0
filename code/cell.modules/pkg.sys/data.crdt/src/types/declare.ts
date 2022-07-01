/**
 * Taken from notes in loader README:
 *
 *    https://github.com/webpack-contrib/worker-loader#integrating-with-typescript
 *
 * NOTE:
 *    Setting inline (with no fallback) prevents CORS issues whereby workers
 *    must comply with a "same-origin policy".  This is a blocking issue when
 *    the bundle is stored on a CDN and (307) redirected to.
 *
 *    This problem is bypassed by having the worker is embedded as a
 *    BLOB by Webpack.
 *
 *    https://github.com/webpack-contrib/worker-loader#cross-origin-policy
 *
 */
declare module 'worker-loader?inline=no-fallback!*' {
  class WebpackWorker extends Worker {
    constructor();
  }
  export default WebpackWorker;
}
