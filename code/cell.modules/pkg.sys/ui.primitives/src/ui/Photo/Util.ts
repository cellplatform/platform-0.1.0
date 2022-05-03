import { t, R, DEFAULT } from './common';

export const Util = {
  /**
   * Convert "loose" photo definition imports into a
   * precise data-type used by the <Photo> component.
   */
  toDefs(inputDef: t.PhotoDefInput = [], inputDefaults?: Partial<t.PhotoDefaults>): t.Photo[] {
    const meta = R.mergeDeepRight(DEFAULT.config, inputDefaults ?? {}) as t.PhotoDefaults;
    const list = Array.isArray(inputDef) ? inputDef : [inputDef];

    const defs = list
      .map((item) => (typeof item === 'string' ? { url: item } : item))
      .map((def) => ({ ...def, transition: def.transition ?? meta.transition }));

    return defs;
  },

  /**
   * Format an input string and return as a parsed URL.
   */
  toUrl(input: string) {
    if (input.startsWith('http')) {
      return new URL(input);
    } else {
      const path = input.replace(/^\/*/, '');
      return new URL(`${location.origin}/${path}`);
    }
  },
};
