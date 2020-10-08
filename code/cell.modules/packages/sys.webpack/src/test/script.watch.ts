import { configuration, Webpack } from './webpack';

const config = configuration().mode('dev');
Webpack.watch(config);
