import { Webpack } from 'sys.webpack';

export const configuration = Webpack.config.create('foo').port(3001).title('My Foo');
