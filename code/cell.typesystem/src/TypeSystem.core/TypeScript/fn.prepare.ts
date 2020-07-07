import * as line from './fn.line';

/**
 * Final preparation of a code file (foramtting and clean up).
 */
export function prepare(args: {
  code: string;
  header?: string;
  exports?: boolean;
  imports?: boolean;
  typeIndex?: boolean;
}) {
  const { header, code } = args;
  const lines = code.split('\n');
  const isRefUsed = lines.some((text) => line.includesRef(text));
  const imports = args.imports !== false ? `import * as t from '@platform/cell.types';` : '';
  const typeIndex = args.typeIndex !== false ? extractTypeIndex(lines) : '';

  let res = '';

  // Prepend header.
  res = !header ? res : `${res}\n${header}\n`;
  res = !isRefUsed || !imports ? res : `${res}\n${imports}\n`;
  res = !typeIndex ? res : `${res}\n${typeIndex}`;
  res = `${res}\n${code}`;

  // Clean up code.
  res = res[0] === '\n' ? res.substring(1) : res; // NB: Trim first new-line.
  res = res.replace(/\n{3,}/g, '\n\n'); // NB: collapse any multi-line spaces.
  res = res.replace(/\n*$/, '');
  res = res.length > 0 ? `${res}\n` : res;

  // Finish up.
  return res;
}

/**
 * [Helpers]
 */

function extractTypeIndex(lines: string[]) {
  const exports = lines.some((line) => line.startsWith('export declare'));
  const declare = exports === false ? 'declare' : 'export declare';

  const typenames = lines.map((text) => line.extractTypename(text)).filter((line) => Boolean(line));
  const props = typenames.map((typename) => `  ${typename}: ${typename};`);

  const res = `
${declare} type TypeIndex = {
${props.join('\n')}
};`.substring(1);

  return res;
}
