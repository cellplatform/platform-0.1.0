import { webpack } from 'webpack';
import { config } from './tmp.config';

// webpack.
// console.log("webpack", config)

// webpack.version

const res = webpack(config as any);

// console.log("res", res)
console.log('-------------------------------------------');

res.run((err, stats) => {
  console.log('err', err);
  // console.log("stats", stats)
});
