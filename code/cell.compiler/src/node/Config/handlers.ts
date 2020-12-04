import { Builder, DEFAULT, Encoding, fs, R, t, value as valueUtil } from '../common';
import { wp } from '../config.webpack';
import { webpackMethods } from './handlers.webpack';
import { FileRedirects, validate } from './util';
import { htmlMethods } from './handlers.html';
import { filesMethods } from './handlers.files';

type O = Record<string, unknown>;

const format = Builder.format;
const MODES: t.WpMode[] = ['development', 'production'];

/**
 * Root handlers.
 */
export const handlers: t.BuilderHandlers<t.CompilerModel, t.CompilerModelMethods> = {
  clone: (args) => args.clone(args.params[0]),
  toObject: (args) => args.model.state,
  toWebpack: (args) => wp.toWebpackConfig(args.model.state),
  name: (args) => args.model.state.name,

  namespace(args) {
    const value = format.string(args.params[0], { trim: true });
    const error = validate.namespace(value).error;
    if (error) {
      throw new Error(`Invalid namespace ("scope"). ${error}`);
    }
    args.model.change((draft) => (draft.namespace = value));
  },

  title(args) {
    const value = format.string(args.params[0], { trim: true });
    args.model.change((draft) => (draft.title = value));
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

  target(args) {
    args.model.change((draft) => {
      draft.target = format.string(args.params[0], { trim: true });
    });
  },

  outdir(args) {
    args.model.change((draft) => {
      const input = format.string(args.params[0], { trim: true });
      draft.outdir = input ? fs.resolve(input) : undefined;
    });
  },

  static(args) {
    args.model.change((draft) => {
      const input = args.params[0];
      if (input === null) {
        draft.static = undefined;
      } else {
        const value = Array.isArray(input) ? input : [input];
        draft.static = value
          .filter((dir) => typeof dir === 'string')
          .map((dir) => dir.trim())
          .filter(Boolean)
          .map((dir) => fs.resolve(dir))
          .map((dir) => ({ dir }));
        draft.static = (draft.static || []).length === 0 ? undefined : draft.static;
        draft.static = draft.static ? R.uniq(draft.static) : draft.static;
      }
    });
  },

  port(args) {
    args.model.change((draft) => {
      draft.port = format.number(args.params[0], { default: DEFAULT.CONFIG.port });
    });
  },

  lint(args) {
    args.model.change((draft) => {
      draft.lint = format.boolean(args.params[0]);
    });
  },

  env(args) {
    args.model.change((draft) => {
      const input = args.params[0];
      if (input === null) {
        draft.env = undefined;
      } else {
        draft.env = { ...draft.env, ...input };
      }
    });
  },

  entry(args) {
    const writeEntry = (p1: any, p2: any) => {
      const param = (value: any) => format.string(value, { trim: true }) || '';
      const value = p2 === undefined ? undefined : param(p2);
      writePathMap(args.model, 'entry', param(p1), value);
    };
    if (typeof args.params[0] === 'object') {
      const map = args.params[0];
      const keys = Object.keys(map);
      args.model.change((draft) => (draft.entry = undefined)); // {} == reset.
      if (keys.length === 0) {
      }
      keys.forEach((key) => writeEntry(key, map[key]));
    } else {
      writeEntry(args.params[0], args.params[1]);
    }
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
    const handler = args.params[0] as t.CompilerConfigSharedFunc;
    if (typeof handler !== 'function') {
      throw new Error(`A function setter parameter required`);
    }
    writeShared({ model: args.model, handler });
  },

  beforeCompile(args) {
    const handler = args.params[0];
    if (typeof handler === 'function') {
      args.model.change((draft) => {
        (draft.beforeCompile || (draft.beforeCompile = [])).push(handler);
      });
    }
  },

  afterCompile(args) {
    const handler = args.params[0];
    if (typeof handler === 'function') {
      args.model.change((draft) => {
        (draft.afterCompile || (draft.afterCompile = [])).push(handler);
      });
    }
  },

  variant(args) {
    const model = args.model;
    const name = format.string(args.params[0], { trim: true }) || '';
    const fn = args.params[1];

    if (!name) {
      throw new Error(`Variant name not provided.`);
    }
    if (typeof fn !== 'function') {
      throw new Error(`Variant configuration builder not provided`);
    }

    const create = (model: t.CompilerModelState, name: string) => {
      const variant = args.clone({ name, parent: () => model.state });
      model.change((draft) => (draft.variants || (draft.variants = [])).push(variant));
      return variant;
    };

    const getOrCreate = (model: t.CompilerModelState, name: string) => {
      return findVariant(model.state, name) || create(model, name);
    };

    fn(getOrCreate(model, name));
  },

  webpack(args) {
    const fn = args.params[0];
    if (typeof fn !== 'function') {
      throw new Error(`Webpack builder function not provided`);
    } else {
      fn(webpackMethods(args.model));
    }
  },

  html(args) {
    const fn = args.params[0];
    if (typeof fn !== 'function') {
      throw new Error(`Html builder function not provided`);
    } else {
      fn(htmlMethods(args.model));
    }
  },

  files(args) {
    const fn = args.params[0];
    if (typeof fn !== 'function') {
      throw new Error(`Files builder function not provided`);
    } else {
      fn(filesMethods(args.model));
    }
  },

  find(args) {
    const name = format.string(args.params[0], { trim: true }) || '';
    return findVariant(args.model.state, name) || null;
  },
};

/**
 * [Helpers]
 */

const findVariant = (model: t.CompilerModel, name: string) => {
  const list = model.variants || [];
  return list.find((item) => item.name() === name);
};

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
    entry[Encoding.escapePath(key)] = value;
    const obj = valueUtil.deleteEmpty(entry as any);
    if (Object.keys(obj).length > 0) {
      draft[objectField] = obj;
    } else {
      delete draft[objectField];
    }
  });
}

function writeShared(args: {
  model: t.BuilderModel<t.CompilerModel>;
  handler: t.CompilerConfigSharedFunc;
}) {
  const { model, handler } = args;
  const cwd = process.cwd();
  const pkg = loadPackageJson(cwd);
  const dependencies = pkg?.dependencies || {};
  const devDependencies = pkg?.devDependencies || {};

  const dependencyExists = (name: string) => {
    const exists = Boolean(ctx.version(name));

    if (!exists) {
      const err = `Cannot add shared module '${name}' as it does not exist in [package.json].`;
      throw new Error(err);
    }

    return exists;
  };

  const ctx: t.CompilerConfigShared = {
    cwd,
    dependencies,
    devDependencies,
    version: (name) => dependencies[name] || devDependencies[name],
    add(input: Record<string, string> | string | string[]) {
      model.change((draft) => {
        const shared = draft.shared || (draft.shared = {});
        if (Array.isArray(input) || typeof input === 'string') {
          const names = Array.isArray(input) ? input : [input];
          names
            .filter((name) => dependencyExists(name))
            .forEach((name) => {
              shared[Encoding.escapePath(name)] = ctx.version(name);
            });
        } else if (typeof input === 'object') {
          draft.shared = { ...shared, ...Encoding.transformKeys(input, Encoding.escapePath) };
        }
      });
      return ctx;
    },
    singleton(input: string) {
      model.change((draft) => {
        const shared = draft.shared || (draft.shared = {});
        const names = Array.isArray(input) ? input : [input];
        names
          .filter((name) => dependencyExists(name))
          .forEach((name) => {
            shared[Encoding.escapePath(name)] = {
              singleton: true,
              requiredVersion: ctx.version(name),
            };
          });
      });
      return ctx;
    },
  };

  handler(ctx);
}
