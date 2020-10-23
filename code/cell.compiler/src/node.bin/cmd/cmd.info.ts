import { log, t, ModuleFederationPlugin } from '../common';
import * as util from '../util';

const logger = util.logger;

/**
 * Output info about the build.
 */
export async function info(argv: t.Argv) {
  const name = util.nameArg(argv);
  const config = await util.loadConfig(argv.config, { name });

  const webpack = config.toWebpack();
  const plugins = webpack.plugins || [];
  const rules = webpack.module?.rules || [];
  const mf = plugins.find((plugin) => plugin instanceof ModuleFederationPlugin);
  const model = config.toObject();

  const div = () => logger.newline().hr().newline();

  log.info();
  if (model.variants) {
    model.variants = model.variants.map((b) => b.name()) as any;
  }
  log.info.cyan('Configuration (Model)');
  log.info(model);

  div();

  log.info.cyan('Webpack');
  log.info({
    ...webpack,
    plugins: plugins.map((plugin) => plugin?.constructor?.name),
  });

  div();

  log.info.cyan('Webpack: Rules');
  rules.forEach((rule) => {
    log.info.yellow(`${rule.test?.source || '<no-test>'}`);
    log.info(rule.use);
    log.info();
  });

  div();

  log.info.cyan('Webpack: Module Federation');
  log.info(mf?._options);

  div();

  logger.model(model).newline().variants(model).newline().exports(model).newline();

  div();
}
