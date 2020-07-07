/**
 * Determine if the line of code is a REF.
 */
export function includesRef(line: string) {
  return line.includes('t.ITypedSheetRefs<') || line.includes('t.ITypedSheetRef<');
}

/**
 * Determine if the line of code is a `type` declaration.
 */
export function isDeclaration(line: string) {
  return Boolean(line.match(/declare type [a-zA-Z0-9]+ \= \{/));
}

/**
 * Extracts the typename from a line that contains a type declaration.
 */
export function extractTypename(line: string) {
  if (!isDeclaration(line)) {
    return '';
  }
  line = line
    .trimLeft()
    .replace(/^export/, '')
    .trimLeft()
    .replace(/^declare type/, '')
    .trimLeft();

  return line.substring(0, line.indexOf(' '));
}
