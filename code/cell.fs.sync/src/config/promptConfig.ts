import { log, cli, Schema, t, defaultValue } from '../common';
import { ConfigDir } from './ConfigDir';

import { parse as parseUrl } from 'url';

/**
 * Prompt for configuration if it does not exist, otherwise load.
 */
export async function promptConfig(args: { force?: boolean; dir?: string; save?: boolean } = {}) {
  const config = await ConfigDir.create({ dir: args.dir }).load();
  if (config.exists && !args.force) {
    return config;
  }

  log.info.gray(`configure directory:`);
  log.info.gray(`  ${config.dir}`);
  log.info();

  const targetOption = await cli.prompt.list({
    message: 'target cell:',
    items: [
      { name: 'create new', value: 'NEW' },
      { name: 'existing uri', value: 'URI' },
    ],
  });

  if (targetOption === 'URI') {
    const target = await cli.prompt.text({ message: 'target cell (uri):' });
    if (target.startsWith('http:') || target.startsWith('https:')) {
      const url = parseUrl(target);
      config.data.host = url.host || '';
      config.data.target = (url.pathname || '').replace(/^\/*/, '').split('/')[0] || '';
    } else {
      config.data.target = target;
    }
  }

  if (targetOption === 'NEW') {
    const ns = Schema.cuid();
    const key = await cli.prompt.text({ message: 'cell key (eg A1):' });
    const uri = Schema.uri.parse<t.ICellUri>(`cell:${ns}:${key || 'A1'}`);
    config.data.target = uri.ok ? uri.toString() : `cell:${ns}!`;
  }

  if (!config.data.host) {
    config.data.host = await cli.prompt.text({ message: 'host domain' });
  }

  const validation = config.validate();
  if (!validation.isValid) {
    log.info();
    log.warn(`✋  Problems with configuration:`);
    validation.errors.forEach(err => {
      log.info.yellow(` - ${log.white(err.message)}`);
    });
    log.info();
  }

  if (validation.isValid && defaultValue(args.save, true)) {
    await config.save();
  }

  // Finish up.
  return config;
}
