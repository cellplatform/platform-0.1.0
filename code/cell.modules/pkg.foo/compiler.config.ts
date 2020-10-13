import { Webpack } from '@platform/cell.compiler';
export { Webpack };

export const config = () =>
  Webpack.config
    .create('foo')
    .port(3001)
    .title('My Foo')
    .entry('main', './src/index')
    .expose('./Header', './src/Header')
    .shared((args) => args.deps)
    .clone();

export default config;
