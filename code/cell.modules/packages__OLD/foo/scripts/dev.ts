import { Webpack } from 'sys.webpack';
import { configuration } from '../src/config';

const config = configuration();
Webpack.dev(config);
