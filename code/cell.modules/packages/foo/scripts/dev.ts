import { Webpack } from 'sys.webpack';
import { configuration } from '../src/webpack';

const config = configuration();
Webpack.dev(config);
