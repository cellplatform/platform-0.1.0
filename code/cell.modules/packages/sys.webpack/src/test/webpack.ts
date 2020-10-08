import { Webpack } from '..';
export { Webpack };

export function configuration() {
  return Webpack.config
    .create('home')
    .entry('main', './src/test/entry.ts')
    .remote('foo', 'foo@http://localhost:3001/remoteEntry.js')
    .clone();
}
