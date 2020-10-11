import { configuration, Webpack } from './config';

const config = configuration().title('My Title');
Webpack.dev(config);
