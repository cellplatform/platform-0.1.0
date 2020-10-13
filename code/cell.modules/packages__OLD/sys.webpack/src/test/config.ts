import { Webpack } from '..';
export { Webpack };

export function configuration() {
  return Webpack.config
    .create('home')
    .port(1234)
    .entry('./src/test/entry')
    .remote('foo', 'foo@http://localhost:3001/remoteEntry.js')
    .clone();

  // return Webpack.config
  //   .create('home')
  //   .port(1234)
  //   .entry('./src/test/entry')
  //   .remote('foo', 'foo@http://localhost:3001/remoteEntry.js')
  //   .shared((args) => args.deps)
  //   .clone();
}
