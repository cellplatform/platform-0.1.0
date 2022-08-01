import {
  Builder,
  DEFAULT,
  Encoding,
  fs,
  ModelPaths,
  semver,
  t,
  value as valueUtil,
} from '../common';
import { wp } from '../Config.webpack';
import { filesMethods } from './handlers.files';
import { htmlMethods } from './handlers.html';
import { webpackMethods } from './handlers.webpack';
import { validate } from './util';

type O = Record<string, unknown>;

const format = Builder.format;
const MODES: t.WpMode[] = ['development', 'production'];

/**
 * Root handlers.
 */
export const handlers: t.BuilderHandlers<t.CompilerModel, t.CompilerModelMethods> = {
  clone: (args) => args.clone(args.params[0]),
  name: (args) => args.model.state.name,

  toWebpack: (args) => wp.toWebpackConfig(args.model.state),
  toObject: (args) => args.model.state,
  toPaths: (args) => ModelPaths(args.model.state),

  namespace(args) {
    const value = format.string(args.params[0], { trim: true });
    const error = validate.namespace(value).error;
    if (error) {
      throw new Error(`Invalid namespace ("scope"). ${error}`);
    }
    args.model.change((draft) => (draft.namespace = value));
  },

  version(args) {
    let value = format.string(args.params[0], { trim: true });
    if (value) {
      value = semver.coerce(value)?.version || undefined;
      value = semver.clean(value || '') || undefined;

      const isValid = Boolean(semver.valid(value));
      if (!isValid) {
        throw new Error(`Invalid version "${value}" (https://semver.org).`);
      }
    }

    args.model.change((draft) => (draft.version = value));
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
        if (Array.isArray(input)) throw new Error(`Not expecting array.`);
        const format = (value: any) => {
          if (typeof value !== 'string') return '';
          const path = value.trim();
          return path ? fs.resolve(path) : '';
        };
        const dir = format(input);
        const list = draft.static || (draft.static = []);
        if (dir && !list.some((item) => item.dir === dir)) list.push({ dir });
        draft.static = list.length === 0 ? undefined : list;
      }
    });
  },

  declarations(args) {
    args.model.change((draft) => {
      if (args.params[0] === null) {
        draft.declarations = undefined;
      } else {
        const declarations = (draft.declarations = draft.declarations || []);

        const include = format.string(args.params[0], { trim: true });
        if (typeof include === 'string') {
          let dir = format.string(args.params[1], { trim: true }) || '';

          dir = dir.replace(/^\/*/, '').replace(/\/*$/, '');
          dir = dir.replace(/^types\.d/, '');
          dir = dir.replace(/^\/*/, '').replace(/\/*$/, '');
          dir = `${dir}`.replace(/\/*$/, '').trim();
          dir = dir || 'main';

          const existing = declarations.find((item) => item.dir === dir);

          if (existing) {
            const list = (existing.include = Array.isArray(existing.include)
              ? existing.include
              : [existing.include]);
            if (!list.some((value) => value === include)) {
              list.push(include); // NB: De-duped.
            }
          } else {
            declarations.push({ include, dir });
          }
        }

        // Remove array if empty.
        if (draft.declarations?.length === 0) draft.declarations = undefined;
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
  return exists ? (fs.readJsonSync(path) as t.NpmPackageJson) : undefined;
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
