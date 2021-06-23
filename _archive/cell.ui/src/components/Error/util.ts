import { t } from '../../common';

/**
 * Parses an error into a usable object.
 */
export function parseError(error: Error | string): t.IErrorInfo {
  const err = typeof error === 'string' ? new Error(error) : error;
  const { message, name } = err;
  const stack = parseErrorStack(err.stack || '');
  return { message, name, stack };
}

/**
 * Parses an error stack-trace into a usable object.
 */
export function parseErrorStack(input: string): t.IErrorStack[] {
  input = input.trim();
  if (!input) {
    return [];
  }

  const result: t.IErrorStack[] = [];

  const toSuffix = (line: string) => {
    const match = line.match(/\(.*\)$/);
    return Array.isArray(match) ? match[0] : '';
  };

  const toPosition = (suffix: string) => {
    const match = suffix.match(/\:\d+\:\d+$/);
    if (!match) {
      return { line: -1, char: -1 };
    } else {
      const parts = match[0].split(':');
      return { line: parseInt(parts[1], 10), char: parseInt(parts[2], 10) };
    }
  };

  const toFile = (suffix: string) => {
    const location = suffix.trim().replace(/^\(/, '').replace(/\)$/, '');
    const anon = suffix.startsWith('<anonymous>');
    return { location, ...toPosition(location), anon };
  };

  input
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('at '))
    .forEach((line) => {
      const suffix = toSuffix(line);
      const text = line.substring(0, line.length - suffix.length - 1).replace(/\s*at\s*/, '');
      result.push({ text, ...toFile(suffix), toString: () => line });
    });

  return result;
}

/**
 * Parses a React component stack.
 */
export function parseComponentStack(input: string) {
  input = input.trim();
  const result: t.IErrorComponent = { name: '', stack: [], toString: () => input };

  const toSuffix = (line: string) => {
    const match = line.match(/\(.*\)$/);
    return Array.isArray(match) ? match[0] : '';
  };

  const toCreatedBy = (suffix: string) => {
    suffix = suffix.trim().replace(/^\(/, '').replace(/\)$/, '').trim();
    return suffix ? suffix.substring('created by'.length).trim() : '';
  };

  const parseLine = (line: string) => {
    const suffix = toSuffix(line);
    let lineIn = line;
    lineIn = lineIn.trim().replace(/^line/, '').trim().replace(/^in/, '').trim();
    lineIn = lineIn.substring(0, lineIn.length - suffix.length).trim();
    const createdBy = toCreatedBy(suffix);
    const res: t.IErrorComponentStack = { lineIn, createdBy, toString: () => line };
    return res;
  };

  input.split('\n').forEach((line) => {
    result.stack.push(parseLine(line));
  });

  result.name = result.stack[0].lineIn;
  return result;
}
