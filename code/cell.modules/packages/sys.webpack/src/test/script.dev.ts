import { configuration, Webpack } from './webpack';

const config = configuration().title('My Title');
Webpack.dev(config);
