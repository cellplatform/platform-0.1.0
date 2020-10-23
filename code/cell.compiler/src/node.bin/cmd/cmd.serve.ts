import { t, exec, fs, Model } from '../common';
import * as util from '../util';

const logger = util.logger;

/**
 * Start a simple HTTP server to serve bundled assets.
 */
export async function serve(argv: t.Argv) {
  const name = util.nameArg(argv) || 'prod';

  const config = await util.loadConfig(argv.config, { name });
  const model = Model(config.toObject());
  const port = model.port();
  const dir = model.dir() || '';
  const target = model.target('web')[0];

  const cwd = fs.join(dir, target);
  const cmd = `serve --listen ${port} --cors`;

  logger.newline();
  logger.model(config.toObject());
  logger.newline().hr();
  exec.command(cmd).run({ cwd });
}
