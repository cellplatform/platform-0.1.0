const match = /[|\\{}()[\]^$+*?.]/g;

export function escapeStringRegex(text: string) {
  if (typeof text !== 'string') throw new TypeError('Must be a string');
  return text.replace(match, '\\$&');
}
