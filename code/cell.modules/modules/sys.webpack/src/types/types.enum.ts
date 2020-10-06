/**
 * https://webpack.js.org/configuration/mode/
 */
export type WebpackMode = 'production' | 'development';

/**
 * https://webpack.js.org/configuration/devtool/
 */
export type WebpackDevtool =
  | 'eval'
  | 'eval-cheap-source-map'
  | 'eval-cheap-module-source-map'
  | 'eval-source-map'
  | 'eval-nosources-source-map'
  | 'eval-nosources-cheap-source-map'
  | 'eval-nosources-cheap-module-source-map'
  | 'cheap-source-map'
  | 'cheap-module-source-map'
  | 'inline-cheap-source-map'
  | 'inline-cheap-module-source-map'
  | 'inline-source-map'
  | 'inline-nosources-source-map'
  | 'inline-nosources-cheap-source-map'
  | 'inline-nosources-cheap-module-source-map'
  | 'source-map'
  | 'hidden-source-map'
  | 'hidden-nosources-source-map'
  | 'hidden-nosources-cheap-source-map'
  | 'hidden-nosources-cheap-module-source-map'
  | 'hidden-cheap-source-map'
  | 'hidden-cheap-module-source-map'
  | 'nosources-source-map'
  | 'nosources-cheap-source-map'
  | 'nosources-cheap-module-source-map';
