import * as line from './fn.line';

/**
 * Final preparation of a code file (foramtting and clean up).
 */
export function prepare(args: {
  code: string;
  header?: string;
  exports?: boolean;
  imports?: boolean;
}) {
  const { header, code } = args;
  const lines = code.split('\n');
  const isRefUsed = lines.some((text) => line.includesRef(text));
  const imports = args.imports !== false ? `import * as t from '@platform/cell.types';` : '';
  const typeIndex = extractTypeIndex({ lines, header: Boolean(header) });

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

function extractTypeIndex(args: { lines: string[]; header: boolean }) {
  const { lines } = args;
  const typenames = lines.map((text) => line.extractTypename(text)).filter((line) => Boolean(line));
  if (typenames.length === 0) {
    return '';
  }

  const exports = lines.some((line) => line.startsWith('export declare'));
  const declare = exports === false ? 'declare' : 'export declare';
  const props = typenames.map((typename) => `  ${typename}: ${typename};`);

  const header = `
/**
 * Complete index of types available within the sheet.
 * Use by passing into a sheet at creation, for example:
 *
 *    const sheet = await TypedSheet.load<t.TypeIndex>({ ns, fetch });
 *
 */`.substring(1);

  let res = `
${declare} type TypeIndex = {
${props.join('\n')}
};`.substring(1);

  res = !args.header ? res : `${header}\n${res}`;

  return res;
}
