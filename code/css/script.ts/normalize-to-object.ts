import { fs } from '@platform/fs';
import { inspect } from 'util';

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
})();

/**
 * Save.
 */
export async function save(name: string, source: string, target: string) {
  const obj = await toObject(source);

  const text = `
/**
 * Source: ${source}
 */    
${obj.toString({ export: true, const: name })}
`.substring(1);

  target = fs.resolve(target);
  await fs.ensureDir(fs.dirname(target));
  await fs.writeFile(target, text);
}

/**
 * Convert the given CSS file into a JS object that can be
 * passed to the `style.global` helper.
 */
export async function toObject(filepath: string) {
  const text = (await fs.readFile(fs.resolve(filepath))).toString();

  const object = toDeclarations(text).reduce((acc, next) => {
    acc[next.selector] = next.items.reduce((acc, next) => {
      acc[next.name] = next.value;
      return acc;
    }, {});
    return acc;
  }, {});

  return {
    object,
    toString(args: { const?: string; export?: boolean } = {}) {
      let text = inspect(object, { colors: false, compact: false });
      text = args.const ? `const ${args.const} = ${text};` : text;
      text = args.export ? `export ${text}` : text;
      return text;
    },
  };
}

/**
 * [Heloers]
 */

function toDeclarations(file: string) {
  const lines = file.split('\n');
  const result: Declaration[] = [];

  const isStart = (line: string) => {
    return line.length > 2 && !line.startsWith('/') && line.endsWith('{');
  };

  const isSelector = (line: string) => {
    return isStart(line) || (line.length > 2 && line.endsWith(','));
  };

  const isEnd = (line: string) => {
    return line.endsWith('}');
  };

  const isStyleLine = (line: string) => {
    return line.length > 2 && !line.startsWith('/') && line.includes(':');
  };

  let selector: string[] = [];
  let current: Declaration | undefined;

  for (const item of lines) {
    const line = trimLine(item || '');

    if (!current && isSelector(line)) {
      selector.push(line.replace(/\{$/, '').replace(/,$/, '').trim().replace(/\'/g, '"'));
    }

    if (!current && isStart(line)) {
      current = { selector: selector.join(', '), items: [] };
    }

    if (current && !isStart(line) && !isEnd(line) && isStyleLine(line)) {
      current.items.push(toStyle(line));
    }

    if (current && isEnd(line)) {
      result.push(current);
      current = undefined;
      selector = [];
    }
  }

  return result;
}

function formatName(name: string) {
  return name
    .split('-')
    .map((part, i) => (i === 0 ? part : `${part[0].toUpperCase()}${part.substring(1)}`))
    .join('')
    .replace(/\'/g, '"');
}

function trimLine(line: string) {
  line = line.trim();
  line = line.replace(/\/\*.*\*\/$/, '').trim(); // Remove trailing comments.
  line = line.replace(/\;$/, '');
  return line.trim();
}

function toStyle(line: string): Style {
  const parts = trimLine(line).split(':');
  const name = formatName(parts[0].trim());
  const value = parts[1].trim().replace(/;$/, '');
  return { name, value };
}
