import { Webpack } from '..';
export { Webpack };

export function configuration() {
  return Webpack.config
    .create('home')
    .port(1234)
    .entry('main', './src/test/entry')
    .remote('foo', 'foo@http://localhost:3001/remoteEntry.js')
    .clone();
}
