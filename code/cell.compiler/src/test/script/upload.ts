import { configure, Webpack } from '../compiler.config';

const ns = 'ckg2nl70400001wethqd5e0ry';
const cell = Webpack.cell('localhost:5000', `cell:${ns}:A1`);

(async () => {
  const config = configure().target('web').lint(false);
  await cell.upload(config, { force: true, cleanAfter: false });
})();
