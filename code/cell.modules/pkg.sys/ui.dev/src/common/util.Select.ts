import { DEFAULT, slug, t } from '../common';

export const SelectUtil = {
  default(initial?: Partial<t.ActionSelect>): t.ActionSelect {
    return {
      id: slug(),
      view: 'dropdown',
      kind: 'dev/select',
      multi: false,
      clearable: undefined,
      items: [],
      current: [],
      handlers: [],
      ...initial,
    };
  },

  /**
   * Convert a loose set of input types into a strongly-typed object.
   */
  toOption<V extends any = any>(input?: t.ActionSelectItemInput): t.ActionSelectItem<V> {
    if (typeof input === 'object') {
      return input;
    } else {
      const label = (input === undefined ? '' : input).toString().trim() || DEFAULT.UNNAMED;
      return { label, value: input as V };
    }
  },
};
