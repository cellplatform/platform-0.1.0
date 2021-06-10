import { t, exec, fs, Model, defaultValue } from '../common';
import * as util from '../util';

const logger = util.Logger;

/**
 * Start a simple HTTP server to serve bundled assets.
 */
export async function serve(argv: t.Argv) {
  const name = util.nameArg(argv, 'web');
  const config = await util.loadConfig(argv.config, { name });
  const portArg = typeof argv.port === 'number' ? argv.port : undefined;

  const model = Model(config.toObject());
  const obj = model.toObject();

  const port = defaultValue(portArg, model.port());
  const dir = model.outdir() || '';
  const target = model.target('web');

  const cwd = fs.join(dir, target);
  const cmd = `serve --listen ${port} --cors`;

  logger.newline().model(obj, { url: true, port }).newline().exports(obj).newline().hr();
  exec.command(cmd).run({ cwd });
}
