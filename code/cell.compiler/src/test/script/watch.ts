import { configure, Webpack } from '../compiler.config';

const config = configure().mode('dev');
Webpack.watch(config);
