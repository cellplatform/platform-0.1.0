import { Webpack } from 'sys.webpack';
export { Webpack };

export const configuration = () => {
  const config = Webpack.config
    .create('foo')
    .port(3001)
    .title('My Foo')
    .entry('main', './src/index')
    .expose('./Header', './src/Header')
    .shared((args) => args.deps)
    .clone();

  return config;
};
