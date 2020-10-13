import { configuration, Webpack } from '../config';

const config = configuration().mode('prod').target('node').lint(true);
Webpack.bundle(config);
