/**
 * Retrieves the singular or plural version of a word.
 */
export function plural(singular: string, plural: string) {
  return {
    singular,
    plural,
    toString(total: number = 0) {
      total = typeof total === 'number' ? total : 0;
      return total === 1 || total === -1 ? singular : plural;
    },
  };
}
