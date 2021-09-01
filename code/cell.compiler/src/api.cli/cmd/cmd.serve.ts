import { defaultValue, exec, fs, log, Model, t } from '../common';
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
  const cwd = fs.resolve(model.paths.out.dist);

  if (!(await fs.pathExists(cwd))) {
    log.info();
    log.info.yellow(`Cannot start server: bundle has not been compiled.`);
    log.info.gray(`${cwd}`);
    log.info();
    return;
  }

  const cmd = `serve --listen ${port} --cors`;

  logger.newline().model(obj, { url: true, port }).newline().exports(obj).newline().hr();
  exec.command(cmd).run({ cwd });
}
