import { DEFAULT, format, slug, t } from '../../common';

type O = Record<string, unknown>;

export const Select = {
  default(initial?: Partial<t.DevActionSelect>): t.DevActionSelect {
    return {
      id: slug(),
      kind: 'select',
      label: DEFAULT.UNNAMED,
      multi: false,
      clearable: false,
      items: [],
      current: [],
      ...initial,
    };
  },

  /**
   * A [Select] dropdown configurator.
   */
  config<Ctx extends O>(ctx: Ctx, params: any[]) {
    const item = Select.default();

    const config: t.DevActionSelectConfigArgs<any> = {
      ctx,
      label(value) {
        item.label = format.string(value, { trim: true }) || DEFAULT.UNNAMED;
        return config;
      },
      description(value) {
        item.description = format.string(value, { trim: true });
        return config;
      },
      items(list) {
        if (Array.isArray(list)) item.items = list;
        return config;
      },
      initial(value) {
        item.initial = value;
        return config;
      },
      multi(value) {
        item.multi = value;
        return config;
      },
      clearable(value) {
        item.clearable = value;
        return config;
      },
      handler(handler) {
        item.handler = handler;
        return config;
      },
    };

    if (typeof params[0] === 'function') {
      params[0](config);
    }

    return { item, config };
  },

  /**
   * Convert a loose set of input types into a strongly-typed object.
   */
  toOption<V extends any = any>(input?: t.DevActionSelectItemInput): t.DevActionSelectItem<V> {
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
  assignInitial(item?: t.DevActionItem) {
    if (item?.kind === 'select' && item.initial !== undefined) {
      let initial = Array.isArray(item.initial) ? item.initial : [item.initial];
      initial = item.multi ? initial : initial.slice(0, 1); // NB: if not "multi" only take the first item.
      item.current = initial.map((value) => Select.toOption(value));
    }

    return item;
  },
};
