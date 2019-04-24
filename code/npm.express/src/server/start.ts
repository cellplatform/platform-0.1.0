import * as minimist from 'minimist';

import { is, log, t, value } from '../common';
import { init } from './server';
import { start } from '../router/routes.run';
import { update } from '../router/routes.update';

/**
 * Retrieve command-line args.
 */
const argv = minimist(process.argv.slice(2));

const port = (argv.port || 3000) as number;
const name = argv['npm-module'] as string;
const prerelease = (value.toType(argv.prerelease) || false) as t.NpmPrerelease;
const urlPrefix = argv['url-prefix'] as string | undefined;
const updateOnStartup = (argv.update || false) as boolean;

const fail = (message: string) => {
  log.info();
  log.info('😢');
  log.info.yellow(message);
  log.info();
  process.exit(1);
};

if (!name) {
  fail(`A '--npm-module=<name>' must be passed at startup.`);
}
if (typeof prerelease === 'string' && !['alpha', 'beta'].includes(prerelease.trim())) {
  fail(`Invalid '--prerelease=${prerelease}'. Must be <boolean|alpha|beta>.`);
}

/**
 * Start the server.
 */
const res = init({ name, prerelease, urlPrefix });
const { server, downloadDir } = res;
server.listen(port, async () => {
  const url = log.cyan(`http://localhost:${log.magenta(port)}`);
  const prefix = res.urlPrefix === '/' ? '' : res.urlPrefix;

  log.info.gray(`\n👋  Running on ${url}`);
  log.info();
  log.info.gray(`   - module:         ${log.yellow(name)}`);
  log.info.gray(`   - download-dir:   ${downloadDir}`);
  log.info.gray(`   - prerelease:     ${prerelease}`);
  log.info.gray(`   - prod:           ${is.prod}`);
  log.info();
  log.info.gray(`   Routes\n`);
  log.info.gray(`   - ${log.magenta('GET')}  ${prefix}/status`);
  log.info.gray(`   - ${log.green('POST')} ${prefix}/update`);
  log.info.gray(`   - ${log.green('POST')} ${prefix}/start`);
  log.info.gray(`   - ${log.green('POST')} ${prefix}/stop`);
  log.info();

  if (updateOnStartup) {
    await update({ name, downloadDir, prerelease, restart: true });
  } else {
    await start({ name, downloadDir, prerelease });
  }
});
