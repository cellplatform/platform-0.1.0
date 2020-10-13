import * as compiler from '../../compiler.config';

const config = compiler.configure();
compiler.Webpack.dev(config);
