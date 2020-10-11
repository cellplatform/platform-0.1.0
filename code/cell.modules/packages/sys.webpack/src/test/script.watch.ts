import { configuration, Webpack } from './config';

const config = configuration().mode('dev');
Webpack.watch(config);
