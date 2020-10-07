// import { Webpack } from '..';
import { Webpack } from 'sys.webpack';

import { config } from '../src/config';

// (async () => {})();
// const config = Webpack.config.create('foo').port(3001).title('My Foo');
Webpack.dev(config);
