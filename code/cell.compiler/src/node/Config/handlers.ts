import {
  Builder,
  DEFAULT,
  escapeKeyPath,
  escapeKeyPaths,
  fs,
  log,
  parseUrl,
  t,
  value as valueUtil,
} from '../common';
import { wp } from '../Config.webpack';
import { webpackHandlers } from './handlers.webpack';

type O = Record<string, unknown>;

const format = Builder.format;
const MODES: t.WpMode[] = ['development', 'production'];

/**
 * Root handlers.
 */
export const handlers: t.BuilderHandlers<t.CompilerModel, t.CompilerModelMethods> = {
  webpack: {
    kind: 'object',
    path: '$.webpack',
    builder: (args) => args.create(webpackHandlers),
    default: () => DEFAULT.WEBPACK,
  },

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

  target(args) {
    args.model.change((draft) => {
      const input = args.params[0];
      if (input === false || input === undefined) {
        draft.target = input;
      } else {
        const list = (Array.isArray(input) ? input : [input])
          .map((item) => format.string(item, { trim: true }))
          .filter((item) => Boolean(item)) as string[];
        draft.target = list.length === 0 ? undefined : list;
      }
    });
  },

  dir(args) {
    args.model.change((draft) => {
      const input = format.string(args.params[0], { trim: true });
      draft.dir = input ? fs.resolve(input) : undefined;
    });
  },

  url(args) {
    args.model.change((draft) => {
      const defaultUrl = DEFAULT.CONFIG.url;
      const input = args.params[0];
      const value =
        typeof input === 'number'
          ? `localhost:${input}`
          : format.string(input, { default: defaultUrl, trim: true });
      if (!value) {
        draft.url = defaultUrl;
      } else {
        draft.url = parseUrl(value).toString();
      }
    });
  },

  lint(args) {
    args.model.change((draft) => {
      draft.lint = format.boolean(args.params[0]);
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
      Object.keys(map).forEach((key) => writeEntry(key, map[key]));
    } else {
      writeEntry(args.params[0], args.params[1]);
    }
  },

  // TEMP 🐷
  rule(args) {
    const rule = args.params[0];
    args.model.change((draft) => {
      const rules = draft.rules || (draft.rules = []);
      rules.push(rule);
    });
  },

  // TEMP 🐷
  plugin(args) {
    const plugin = args.params[0];
    args.model.change((draft) => {
      const plugins = draft.plugins || (draft.plugins = []);
      plugins.push(plugin);
    });
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
        const list = draft.beforeCompile || (draft.beforeCompile = []);
        list.push(handler);
      });
    }
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
    if (!exists && process.env.NODE_ENV !== 'test') {
      log.warn(
        `Cannot add shared module '${log.white(name)}' as it does not exist in dependencies.`,
      );
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
              shared[escapeKeyPath(name)] = ctx.version(name);
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
          .filter((name) => dependencyExists(name))
          .forEach((name) => {
            shared[escapeKeyPath(name)] = {
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
