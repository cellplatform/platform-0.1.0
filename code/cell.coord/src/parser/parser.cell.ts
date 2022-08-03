import { R, value, t } from '../common';
import { alpha } from '../alpha';
import { ast } from '../ast';

export const toParts = R.memoizeWith(R.identity, parse);

const removeUriPrefix = (input: string, prefix?: string) => {
  return prefix ? input.replace(new RegExp(`^${prefix}:`), '') : input;
};

function parse(input: string, options: { uriPrefix?: string } = {}) {
  const DEFAULT_RELATIVE = true as boolean | undefined;
  const result = {
    input,
    type: 'CELL' as t.CoordType,
    ns: '',
    key: '',
    error: '',
    isValid: true,
    isWildcard: false,
    column: { value: '', index: -1, isRelative: DEFAULT_RELATIVE },
    row: { value: '', index: -1, isRelative: DEFAULT_RELATIVE },
  };

  const done = (err?: string) => {
    const error = err ? `INVALID "${input}". ${err}` : '';
    result.error = result.error ? result.error : error;
    if (result.error) {
      result.isValid = false;
    }
    if (result.type === 'COLUMN' || result.isWildcard) {
      delete result.row.isRelative;
    }
    if (result.type === 'ROW' || result.isWildcard) {
      delete result.column.isRelative;
    }
    return result;
  };

  // Prepare the input.
  input = input.replace(/^[\s=!]*/, '').trimEnd();
  input = removeUriPrefix(input, options.uriPrefix);
  ['ns', 'cell', 'row', 'col'].forEach((prefix) => (input = removeUriPrefix(input, prefix)));

  // Extract key.
  let parts = input.split('!');
  if (parts.length > 2) {
    return done(`Too many "!" characters.`);
  }
  parts = parts.length > 1 ? parts : ['', input];
  const cellKey = parts[1];

  // Wildcard.
  const wildcard = cellKey === '*' || cellKey === '**' ? cellKey : undefined;
  if (wildcard) {
    result.isWildcard = true;
    result.column.value = cellKey;
    result.row.value = cellKey;
    result.ns = parts.length > 1 ? parts[0] : '';
  }

  // Parse AST.
  const tree = wildcard
    ? ast.toTree(`${parts[0]}!A1`) // HACK: wildcard replaced with A1 temporarily to AST parse correctly.
    : ast.toTree(parts.join('!'));
  let node = tree as ast.CellNode;

  switch (tree.type) {
    case 'cell':
      break;
    case 'number':
      node = { type: 'cell', key: tree.value.toString() };
      break;

    default:
      return done('Not a cell.');
  }

  result.key = (wildcard ? wildcard : node.key) || parts[1];
  result.ns = node.ns || '';

  // Ensure sheet value is valid.
  if (!result.ns && input.includes('!')) {
    return done(`Includes "!" character but no namespace.`);
  }

  // Parse the cell-key.
  if (!wildcard) {
    const parsedKey = parseCellKey(cellKey);
    result.type = parsedKey.type;
    result.column = parsedKey.column;
    result.row = parsedKey.row;
    if (parsedKey.error) {
      return done(parsedKey.error);
    }
  }

  // Finish up.
  return done();
}

function parseCellKey(cellKey = '') {
  const DEFAULT_RELATIVE = true as boolean | undefined;
  const result = {
    type: 'CELL' as t.CoordType,
    error: '',
    column: { value: '', index: -1, isRelative: DEFAULT_RELATIVE },
    row: { value: '', index: -1, isRelative: DEFAULT_RELATIVE },
  };

  const done = (err?: string) => {
    result.error = result.error ? result.error : err || '';
    return result;
  };

  if (!cellKey.trim()) {
    return done(`No cell-key found.`);
  }

  const isRowChar = (char: string) => value.isNumeric(char);

  let stage: 'column' | 'row' = 'column';
  let index = -1;
  for (const char of cellKey.split('')) {
    index++;
    const isLetter = value.isLetter(char);
    const nextChar = cellKey[index + 1];

    // COLUMN
    if (stage === 'column') {
      if (isRowChar(char) || (char === '$' && isRowChar(nextChar))) {
        stage = 'row';
      }

      if (stage === 'column') {
        if (char === '$') {
          if (result.column.value.length > 0 && !isRowChar(nextChar)) {
            result.error = `The "$" (relative) symbol must be at start of column.`;
            break;
          }
          result.column.isRelative = false;
        } else if (!isLetter) {
          result.error = `The character "${char}" is not valid within a column. Must be a letter.`;
        }

        if (isLetter) {
          result.column.value += char;
        }
      }
    }

    // ROW
    if (stage === 'row') {
      const isNumber = value.isNumeric(char);

      if (char === '$') {
        if (result.row.value.length > 0) {
          result.error = `The "$" (relative) symbol must be at start of row.`;

          break;
        }
        result.row.isRelative = false;
      } else if (!isNumber) {
        result.error = `The character "${char}" is not valid within a row. Must be a number.`;
      }

      if (isNumber) {
        result.row.value += char;
      }
    }
  }

  // Determine type.
  if (!result.column.value && !result.row.value) {
    return done(`Cell key contains no column or row data.`);
  }
  result.type =
    result.column.value && result.row.value
      ? 'CELL'
      : result.column.value && !result.row.value
      ? 'COLUMN'
      : !result.column.value && result.row.value
      ? 'ROW'
      : 'CELL';

  // Calculate column index.
  if (result.column.value) {
    const columnIndex = alpha.fromCharacter(result.column.value);
    result.column.index = columnIndex === undefined ? -1 : columnIndex;
  }
  if (result.row.value) {
    const rowIndex = parseInt(result.row.value, 10);
    result.row.index = Number.isNaN(rowIndex) ? -1 : rowIndex - 1;
  }

  // Post parsing clean up.
  result.column.value = result.column.value.toUpperCase();
  return done();
}
