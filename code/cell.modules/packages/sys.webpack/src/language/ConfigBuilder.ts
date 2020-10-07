import { t, Builder, StateObject, DEFAULT } from '../common';

const format = Builder.format;
const MODES: t.WebpackMode[] = ['development', 'production'];

/**
 * Configuration builder factory.
 */
export const ConfigBuilder: t.ConfigBuilder = {
  model(name: string) {
    name = format.string(name, { trim: true }) || '';
    if (!name) {
      throw new Error(`Configuration must be named`);
    }
    return StateObject.create<t.WebpackModel>({ ...DEFAULT.CONFIG, name });
  },

  create(input) {
    const model = typeof input === 'object' ? input : ConfigBuilder.model(input);
    return Builder.create<t.WebpackModel, t.WebpackBuilder>({ model, handlers });
  },
};

/**
 * Root handlers.
 */
const handlers: t.BuilderHandlers<t.WebpackModel, t.WebpackBuilder> = {
  toObject: (args) => args.model.state,
  clone: (args) => args.clone(),

  name(args) {
    args.model.change((draft) => {
      const value = format.string(args.params[0], { trim: true }) || '';
      if (!value) {
        throw new Error(`Configuration must be named`);
      }
      draft.name = value;
    });
  },

  title(args) {
    args.model.change((draft) => {
      draft.title = format.string(args.params[0], { trim: true });
    });
  },

  mode(args) {
    args.model.change((draft) => {
      const defaultMode = DEFAULT.CONFIG.mode;
      let value = format.string(args.params[0], {
        trim: true,
        default: defaultMode,
      }) as t.WebpackMode;

      value = (value as string) === 'prod' ? 'production' : value;
      value = (value as string) === 'dev' ? 'development' : value;

      if (!MODES.includes(value)) {
        throw new Error(`Invalid mode ("production" or "development")`);
      }

      draft.mode = value;
    });
  },

  port(args) {
    args.model.change((draft) => {
      draft.port = format.number(args.params[0], { default: DEFAULT.CONFIG.port }) as number;
    });
  },

  lint(args) {
    args.model.change((draft) => {
      draft.lint = format.boolean(args.params[0]);
    });
  },
};
