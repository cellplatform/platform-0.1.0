import { configure, Webpack } from '../compiler.config';

const config = configure().title('My Title');
Webpack.dev(config);
