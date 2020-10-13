import { configuration, Webpack } from '../config';

const ns = 'ckg2nl70400001wethqd5e0ry';
const cell = Webpack.cell('localhost:5000', `cell:${ns}:A1`);

(async () => {
  const config = configuration().target(['node']).lint(false);

  // await cell.clean();
  // await cell.clean();

  const res = await cell.upload(config, { force: true, cleanAfter: false });
})();
