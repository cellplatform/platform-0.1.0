import { DEFAULT, slug, t } from '../common';

export const SelectUtil = {
  default(initial?: Partial<t.ActionSelect>): t.ActionSelect {
    return {
      id: slug(),
      kind: 'dev/select',
      label: DEFAULT.UNNAMED,
      multi: false,
      clearable: false,
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

  /**
   * Assigns the initial value as current (if there is one).
   */
  // assignInitial(input?: t.ActionItem) {
  //   const item = input as t.ActionSelect;
  //   if (item?.kind === 'dev/select') {
  //     if (item.initial !== undefined) {
  //       let initial = Array.isArray(item.initial) ? item.initial : [item.initial];
  //       initial = item.multi ? initial : initial.slice(0, 1); // NB: if not "multi" only take the first item.
  //       item.current = initial.map((value) => SelectUtil.toOption(value));
  //     }
  //   }
  //   return input;
  // },
};
