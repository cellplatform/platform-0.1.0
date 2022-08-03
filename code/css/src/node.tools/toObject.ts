type Inspect = (
  obj: Record<string, unknown>,
  options: { colors?: boolean; compact?: boolean },
) => string;
type Declaration = { selector: string; items: Style[] };
type Style = { name: string; value: string };

/**
 * Convert the given CSS file into a JS object that can be
 * passed to the [style.global] helper.
 */
export async function toObject(args: { text: string; inspect: Inspect; header?: string }) {
  const root = args;

  const object = toDeclarations(args.text).reduce((acc, next) => {
    acc[next.selector] = next.items.reduce((acc, next) => {
      acc[next.name] = next.value;
      return acc;
    }, {});
    return acc;
  }, {});

  return {
    object,
    toString(args: { const?: string; export?: boolean; header?: string } = {}) {
      let text = root.inspect(object, { colors: false, compact: false });
      text = args.const ? `const ${args.const} = ${text};` : text;
      text = args.export ? `export ${text}` : text;

      const header = (args.header || root.header || '').trim();
      text = header ? `${header}\n\n${text}` : text;
      text = `${text}\n`;

      return text;
    },
  };
}

/**
 * [Helpers]
 */

function toDeclarations(text: string) {
  const lines = stripComments(text.split('\n'));
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
      selector.push(line.replace(/\{$/, '').replace(/,$/, '').trim().replace(/'/g, '"'));
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

function stripComments(lines: string[]) {
  const result: string[] = [];

  let withinComment = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('/*')) {
      withinComment = true;
    }
    if (withinComment && line.endsWith('*/')) {
      withinComment = false;
    }
    if (!withinComment) {
      result.push(line);
    }
  }

  return result;
}

function formatName(name: string) {
  return name
    .split('-')
    .map((part, i) => (i === 0 ? part : `${part[0].toUpperCase()}${part.substring(1)}`))
    .join('')
    .replace(/'/g, '"');
}

function trimLine(line: string) {
  line = line.trim();
  line = line.replace(/\/\*.*\*\/$/, '').trim(); // Remove trailing comments.
  line = line.replace(/;$/, '');
  return line.trim();
}

function toStyle(line: string): Style {
  const parts = trimLine(line).split(':');
  const name = formatName(parts[0].trim());
  const value = parts[1].trim().replace(/;$/, '');
  return { name, value };
}
