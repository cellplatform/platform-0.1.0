import { configure, Webpack } from '../compiler.config';

const config = configure().mode('prod').target('node').lint(true);
Webpack.bundle(config);
