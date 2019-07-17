export { coord } from '../common/libs';

/**
 * Extract the last path of a path, eg "bar" from "foo/bar".
 */
export function lastPart(text: string | number, delimiter: string) {
  text = text === undefined ? '' : text;
  const parts = text.toString().split(delimiter);
  return parts[parts.length - 1];
}
