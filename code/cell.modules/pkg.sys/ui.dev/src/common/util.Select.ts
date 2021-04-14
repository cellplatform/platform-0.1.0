import { DEFAULT, slug, t, R } from '../common';

type Item = t.ActionSelectItem;

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
      isInitialized: false,
      ...initial,
    };
  },

  /**
   * Convert a loose set of input types into a strongly-typed object.
   */
  toItem<V extends any = any>(input?: t.ActionSelectItemInput): t.ActionSelectItem<V> {
    if (SelectUtil.isItem(input)) return input as Item;
    return {
      label: (input === undefined ? '' : input).toString().trim() || DEFAULT.UNNAMED,
      value: input as V,
    };
  },

  /**
   * Converts a complete set of items.
   */
  toInitial<V extends any = any>(model: t.ActionSelect): t.ActionSelectItem<V>[] {
    if (model.initial === undefined) return [];

    const initial = (Array.isArray(model.initial)
      ? model.initial
      : [model.initial]) as t.ActionSelectItemInput[];

    return initial.map((value) => {
      if (!SelectUtil.isItem(value)) {
        // A raw value was passed, scan the list of items to see if there
        // is a match on this value.
        const match = model.items
          .filter((item) => SelectUtil.isItem(item))
          .find((item) => R.equals(value, (item as Item).value));
        if (match) return match as Item;
      }
      return SelectUtil.toItem<V>(value);
    });
  },

  /**
   * Determines if the input value is an [ActionSelectItem] object.
   */
  isItem(input?: t.ActionSelectItemInput) {
    return typeof input === 'object';
  },
};
