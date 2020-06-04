import { fs } from '@platform/fs';
import { inspect } from 'util';
import { log } from '@platform/log/lib/server';
import { toObject } from '../src/node.tools';

/**
 *
 * [Script]
 * Convert common CSS resets into JSS global style objects.
 *
 */
(async () => {
  await save('normalize', 'css/normalize.css', 'src/reset/css.normalize.ts');
  await save('global', 'css/global.css', 'src/reset/css.global.ts');
  log.info();
})();

/**
 * Save.
 */
export async function save(name: string, source: string, target: string) {
  const text = (await fs.readFile(fs.resolve(source))).toString();
  const obj = await toObject({ text, inspect });

  const header = `
/**
 * Source: ${source}
 */    
`.substring(1);
  const output = obj.toString({ export: true, const: name, header });

  target = fs.resolve(target);
  await fs.ensureDir(fs.dirname(target));
  await fs.writeFile(target, output);

  log.info();
  log.info.green(name);
  log.info.gray(target);
}
