import { fs } from '@platform/fs';
import { inspect } from 'util';
import { log } from '@platform/log/lib/server';
import { toObject } from '../src/node.tools';

type Declaration = { selector: string; items: Style[] };
type Style = { name: string; value: string };

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

  const output = `
/**
 * Source: ${source}
 */    
${obj.toString({ export: true, const: name })}
`.substring(1);

  target = fs.resolve(target);
  await fs.ensureDir(fs.dirname(target));
  await fs.writeFile(target, output);

  log.info();
  log.info.green(name);
  log.info.gray(target);
}
