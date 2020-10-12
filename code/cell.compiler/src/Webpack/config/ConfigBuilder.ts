import {
  Builder,
  DEFAULT,
  escapeKeyPath,
  escapeKeyPaths,
  fs,
  StateObject,
  t,
  value as valueUtil,
} from '../common';
import { wp } from '../config.wp';

type O = Record<string, unknown>;

const format = Builder.format;
const MODES: t.WpMode[] = ['development', 'production'];

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
  clone: (args) => args.clone(),
  toObject: (args) => args.model.state,
  toWebpack: (args) => wp.toWebpackConfig(args.model.state),

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
      }) as t.WpMode;

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

  entry(args) {
    const param = (index: number) => format.string(args.params[index], { trim: true }) || '';
    const value = args.params[1] === undefined ? undefined : param(1);
    writePathMap(args.model, 'entry', param(0), value);
  },

  expose(args) {
    const param = (index: number) => format.string(args.params[index], { trim: true }) || '';
    writePathMap(args.model, 'exposes', param(0), param(1));
  },

  remote(args) {
    const param = (index: number) => format.string(args.params[index], { trim: true }) || '';
    writePathMap(args.model, 'remotes', param(0), param(1));
  },

  shared(args) {
    const handler = args.params[0] as t.WebpackBuilderSharedFunc;
    if (typeof handler !== 'function') {
      throw new Error(`A function setter parameter required`);
    }
    writeShared({ model: args.model, handler });
  },
};

/**
 * [Helpers]
 */
function loadPackageJson(cwd: string) {
  const path = fs.join(cwd, 'package.json');
  const exists = fs.existsSync(path);
  return exists ? (fs.readJsonSync(path) as t.INpmPackageJson) : undefined;
}

function writePathMap<M extends O>(
  model: t.BuilderModel<M>,
  objectField: keyof M,
  key: string,
  value: string | undefined,
) {
  if (value === undefined) {
    value = key;
    key = 'main'; // NB: path only passed, set default key "main".
  }

  if (!key) {
    throw new Error(`Entry field 'key' required`);
  }

  model.change((draft) => {
    const entry = draft[objectField] || ((draft as any)[objectField] = {});
    entry[escapeKeyPath(key)] = value;
    const obj = valueUtil.deleteEmpty(entry as any);
    if (Object.keys(obj).length > 0) {
      draft[objectField] = obj;
    } else {
      delete draft[objectField];
    }
  });
}

function writeShared(args: {
  model: t.BuilderModel<t.WebpackModel>;
  handler: t.WebpackBuilderSharedFunc;
}) {
  const { model, handler } = args;
  const cwd = process.cwd();
  const pkg = loadPackageJson(cwd);
  const deps = pkg?.dependencies || {};

  const ctx: t.WebpackBuilderShared = {
    cwd,
    deps,
    add(input: Record<string, string> | string | string[]) {
      model.change((draft) => {
        const shared = draft.shared || (draft.shared = {});
        if (Array.isArray(input) || typeof input === 'string') {
          const names = Array.isArray(input) ? input : [input];
          names
            .filter((name) => deps[name])
            .forEach((name) => {
              shared[escapeKeyPath(name)] = deps[name];
            });
        } else if (typeof input === 'object') {
          draft.shared = { ...shared, ...escapeKeyPaths(input) };
        }
      });
      return ctx;
    },
    singleton(input: string) {
      model.change((draft) => {
        const shared = draft.shared || (draft.shared = {});
        const names = Array.isArray(input) ? input : [input];
        names
          .filter((name) => deps[name])
          .forEach((name) => {
            shared[escapeKeyPath(name)] = { singleton: true, requiredVersion: deps[name] };
          });
      });
      return ctx;
    },
  };

  handler(ctx);
}
