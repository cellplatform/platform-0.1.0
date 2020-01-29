import { cli, fs, log } from '../common';

export async function tmpl(args: { dir: string }) {
  // Prompt the user for which template to load.
  const tmplDir = fs.resolve(fs.join(__dirname, '../../tmpl'));
  const res = await cli.prompt.fs.paths(tmplDir, { pageSize: 10, all: false }).radio('template');
  const dir = res[0];

  log.info('-------------------------------------------');
  log.info('dir', dir);
}
