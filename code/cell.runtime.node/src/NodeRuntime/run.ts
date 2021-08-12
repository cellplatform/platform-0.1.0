import { BundleWrapper } from '../BundleWrapper';
import { fs, log, Logger, PATH, t, deleteUndefined, DEFAULT, R, cuid } from '../common';
import { pullMethod } from './pull';
import { invoke } from './run.invoke';

/**
 * Factory for the [run] method.
 */
export function runMethod(args: {
  bus: t.EventBus<any>;
  cachedir: string;
  stdlibs?: t.RuntimeNodeAllowedStdlib[];
}) {
  const { bus, cachedir, stdlibs } = args;
  const pull = pullMethod({ cachedir });

  /**
   * Pull and run the given bundle.
   */
  const fn: t.RuntimeRun = (
    bundleInput: t.RuntimeBundleOrigin,
    options: t.RuntimeRunOptions = {},
  ) => {
    const tx = cuid();
    const promise = new Promise<t.RuntimeRunResponse>(async (resolve, reject) => {
      const { silent, hash } = options;
      const timeout = wrangleTimeout(options.timeout);
      const bundle = BundleWrapper.create(bundleInput, cachedir);
      const exists = await bundle.isCached();
      const isPullRequired = !exists || options.pull;

      let elapsed = { prep: -1, run: -1 };

      const errors: t.IRuntimeError[] = [];
      const addError = (message: string, stack?: string) =>
        errors.push(
          deleteUndefined({
            type: 'RUNTIME/run',
            bundle: bundle.toObject(),
            message,
            stack,
          }),
        );

      const done = (out?: t.RuntimeOut) => {
        const ok = errors.length === 0;
        out = out || { info: R.clone(DEFAULT.INFO) };
        resolve({ tx, ok, entry, out, errors, manifest, elapsed, timeout });
      };

      // Ensure the bundle has been pulled locally.
      if (isPullRequired) {
        const res = await pull(bundleInput, { silent });
        errors.push(...res.errors);
        if (!res.ok || errors.length > 0) {
          return done();
        }
      }

      const loadManifest = async () => {
        const path = fs.join(bundle.cache.dir, PATH.MANIFEST);
        const exists = await fs.pathExists(path);
        if (!exists) {
          const err = `A bundle manifest file does not exist ${bundle.toString()}.`;
          addError(err);
          return undefined;
        } else {
          try {
            const manifest = (await fs.readJson(path)) as t.ModuleManifest;
            return manifest;
          } catch (error) {
            const msg = error.message;
            const err = `Failed while reading bundle manifest for ${bundle.toString()}. ${msg}`;
            addError(err);
            return undefined;
          }
        }
      };

      const manifest = await loadManifest();
      if (!manifest) {
        return done();
      }

      const entry = (options.entry || manifest.module.entry || '').trim().replace(/^\/*/, '');

      if (!silent) {
        const { yellow, gray, cyan, white, green } = log;
        const module = manifest.module;
        const bytes = manifest.files.reduce((acc, next) => acc + next.bytes, 0);
        const size = fs.size.toString(bytes, { round: 0 });
        const table = log.table({ border: false });
        const add = (key: string, value: string) => {
          table.add([gray(key), ' ', gray(value)]);
        };

        add(green('runtime'), `${cyan('cell.runtime.')}${white('node')}`);
        add('module', `${module.namespace}@${module.version}`);
        add('• bundle', `${module.target} (${module.mode})`);
        add('• entry', entry);
        add('• hash', manifest.hash.module);
        add('manifest ', Logger.format.url(bundle.urls.manifest));
        add('files ', Logger.format.url(bundle.urls.files));
        add('size', `${yellow(size)} (${manifest.files.length} files)`);

        log.info();
        table.log();
        Logger.hr().newline();
      }

      // Execute the code.
      const dir = bundle.cache.dir;
      const res = await invoke({
        tx,
        bus,
        manifest,
        dir,
        silent,
        in: options.in,
        timeout,
        entry,
        hash,
        stdlibs,
        forceCache: isPullRequired,
      });
      elapsed = res.elapsed;
      res.errors.forEach((err) => addError(err.message, err.stack));

      // Finish up.
      return done(res.out);
    });

    type P = t.RuntimeRunPromise;
    (promise as P).tx = tx;
    return promise as P;
  };

  return fn;
}

/**
 * Helpers
 */

function wrangleTimeout(input: t.RuntimeRunOptions['timeout']) {
  if (input === undefined) return DEFAULT.TIMEOUT;
  if (typeof input === 'string') return -1; // "never" timeout.
  return Math.max(-1, input);
}
