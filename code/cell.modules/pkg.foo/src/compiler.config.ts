import { Webpack } from '@platform/cell.compiler';
export { Webpack };

export const configure = () =>
  Webpack.config
    .create('foo')
    .port(3001)
    .title('My Foo')
    .entry('main', './src/index')
    .expose('./Header', './src/Header')
    .shared((e) => e.add(e.deps).singleton(['react', 'react-dom']))
    .clone();

export default configure;
