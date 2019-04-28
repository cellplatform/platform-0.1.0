import * as minimist from 'minimist';

import { is, log, t, value } from '../common';
import { start } from '../router/routes.run';
import { update } from '../router/routes.update';
import { init } from './server';

const { toBool, toNumber } = value;
const argv = minimist(process.argv.slice(2));

const trimQuotes = (value: string) =>
  (value || '')
    .trim()
    .replace(/^\"/, '')
    .replace(/\"$/, '')
    .replace(/^\'/, '')
    .replace(/\'$/, '');

/**
 * Retrieve command-line args.
 * Order of precidence:
 *  1. explicit arg from command (eg "--npm-module")
 *  2. environment variable (eg: "NPM_MODULE")
 */
const arg = <T = string>(cmd: string, env: string, defaultValue: T, format?: (value: any) => T) => {
  let value: any;
  if (argv[cmd]) {
    value = argv[cmd] as T;
  }
  if (!value && process.env[env]) {
    value = (process.env[env] as unknown) as T;
    value = typeof value === 'string' ? trimQuotes(value) : value;
  }
  value = typeof value === 'string' ? value.trim() : value;
  value = value || defaultValue;
  if (format) {
    value = format(value);
  }
  return value as T;
};

const name = arg('npm-module', 'NPM_MODULE', '');
const downloadDir = arg('dir', 'NPM_DIR', '');
const port = arg<number>('port', 'NPM_PORT', 3000, v => toNumber(v));
const urlPrefix = arg('url-prefix', 'NPM_URL_PREFIX', '');
const updateOnStartup = arg('update', 'NPM_UPDATE', false);
const prerelease = arg<t.NpmPrerelease>('prerelease', 'NPM_PRERELEASE', false, v => toBool(v));
const NPM_TOKEN = arg<string | undefined>('npm-token', 'NPM_TOKEN', undefined);

const fail = (message: string) => {
  log.info();
  log.info('😢');
  log.info.yellow(message);
  log.info();
  process.exit(1);
};

if (!name) {
  fail(`MISSING [--npm-module=<name>] must be passed at startup.`);
}
if (!downloadDir) {
  fail(`MISSING [--dir=<string>] must be passed at startup.`);
}
if (typeof prerelease === 'string' && !['alpha', 'beta'].includes(prerelease.trim())) {
  fail(`INVALID [--prerelease=${prerelease}]. Must be <boolean|alpha|beta>.`);
}

/**
 * Start the server.
 */
const res = init({ name, downloadDir, prerelease, urlPrefix, NPM_TOKEN });
const { server } = res;
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
    await update({ name, downloadDir, prerelease, NPM_TOKEN, restart: true });
  } else {
    await start({ name, downloadDir, prerelease, NPM_TOKEN });
  }
});
