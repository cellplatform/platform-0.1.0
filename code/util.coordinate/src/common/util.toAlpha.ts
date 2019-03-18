const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Converts a number to an alphabetic character.
 * Eg:
 *    - 1  => A
 *    - 26 => Z
 *    - 27 => AA
 *    ...etc.
 */
export function toAlphaCharacter(index: number) {
  // Calculate the character multiplier if greater than the length of the alphabet.
  let multiplier = 0;
  if (index > ALPHA.length - 1) {
    multiplier = Math.floor(index / ALPHA.length);
    index = index - multiplier * ALPHA.length;
  }

  // Build the return character.
  let char = ALPHA[index];
  if (multiplier > 0) {
    char = Array.from({ length: multiplier + 1 })
      .map(() => char)
      .join('');
  }

  // Finish up.
  return char;
}

/**
 * Converts an alpha character to it's corresponding index.
 * Eg:
 *    - A  => 1
 *    - Z  => 26
 *    - AA => 27
 *    ...etc.
 */
export function fromAlphaCharacter(value?: string) {
  value = value ? value.trim() : value;
  if (!value) {
    return undefined;
  }
  const parts = value.split('');
  let result = -1;

  parts.forEach((char, i) => {
    const index = ALPHA.indexOf(char);
    const isLast = i === parts.length - 1;
    if (index > -1) {
      result = result < 0 ? 0 : result;
      result += isLast ? index : ALPHA.length;
    }
  });

  return result < 0 ? undefined : result;
}
