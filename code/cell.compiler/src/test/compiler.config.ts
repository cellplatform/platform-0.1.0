import { Webpack } from '..';
export { Webpack };

export function configure() {
  return Webpack.config
    .create('home')
    .port(1234)
    .entry('./src/test/entry')
    .remote('foo', 'foo@http://localhost:3001/remoteEntry.js')
    .shared((args) => {
      // args.add(args.deps);
      // args.singleton(['react', 'react-dom']);
    })
    .clone();
}

export default configure;
