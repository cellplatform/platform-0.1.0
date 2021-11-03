import { Subject } from 'rxjs';
import { takeUntil, filter, map } from 'rxjs/operators';

import { BundleWrapper } from '../BundleWrapper';
import { DEFAULT, deleteUndefined, fs, log, Logger, PATH, R, rx, slug, t, time } from '../common';
import { pullMethodFactory } from './NodeRuntime.pull';
import { invoke } from './NodeRuntime.run.invoke';

type Id = string;

/**
 * Factory for the [run] method.
 */
export function runMethodFactory(args: {
  runtime: Id;
  bus: t.EventBus<any>;
  events: t.RuntimeNodeEvents;
  cachedir: string;
  isDisposed: () => boolean;
  stdlibs?: t.RuntimeNodeAllowedStdlib[];
}) {
  const { runtime, cachedir, stdlibs, isDisposed, events } = args;
  const bus = rx.busAsType<t.RuntimeNodeEvent>(args.bus);
  const pull = pullMethodFactory({ cachedir, isDisposed });

  /**
   * Pull and run the given bundle.
   */
  const fn: t.RuntimeRun = (manifestUrl, options = {}) => {
    if (isDisposed()) throw new Error('Runtime disposed');

    const timer = time.timer();
    const tx = `process:${slug()}`;
    const lifecycle = events.process.lifecycle;

    let isDone = false;
    const done$ = new Subject<void>();
    done$.subscribe(() => (isDone = true));

    const promise = new Promise<t.RuntimeRunResponse>(async (resolve, reject) => {
      let elapsed = { prep: -1, run: -1 }; // NB: Returned from "run" execution.

      const { silent, fileshash } = options;
      const timeout = wrangleTimeout(options.timeout);
      const bundle = BundleWrapper(manifestUrl, cachedir);
      const exists = await bundle.isCached();
      const isPullRequired = !exists || options.pull;

      const errors: t.IRuntimeError[] = [];
      const addError = (message: string, stack?: string) =>
        errors.push(
          deleteUndefined({
            type: 'RUNTIME/run',
            bundle: { url: bundle.url.href },
            message,
            stack,
          }),
        );

      const done = (options: { out?: t.RuntimeOut; stage?: t.RuntimeRunStage } = {}) => {
        if (!isDone) {
          const ok = errors.length === 0;
          const stage = options.stage ?? ok ? 'completed:ok' : 'completed:error';
          const out = options.out ?? { info: R.clone(DEFAULT.INFO) };

          lifecycle.fire(process, stage);
          done$.next();
          done$.complete();

          resolve({ tx, ok, entry, out, errors, manifest, elapsed, timeout });
        }
      };

      /**
       * Monitor "kill" requests.
       */
      events.process.kill.req$.pipe(takeUntil(done$)).subscribe((e) => {
        addError('Process killed');
        done({ stage: 'killed' });
        const msec = timer.elapsed.msec;
        elapsed.run = msec;
        bus.fire({
          type: 'cell.runtime.node/killed',
          payload: { tx: e.tx ?? slug(), runtime, process, elapsed: msec },
        });
      });

      /**
       * Ensure the bundle has been pulled locally.
       */
      if (isPullRequired) {
        const res = await pull(manifestUrl, { silent });
        errors.push(...res.errors);
        if (!res.ok || errors.length > 0) {
          return done();
        }
      }

      /**
       * Retrieve manifest.
       */
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
          } catch (error: any) {
            const msg = error.message;
            const err = `Failed while reading bundle manifest for ${bundle.toString()}. ${msg}`;
            addError(err);
            return undefined;
          }
        }
      };

      const manifest = await loadManifest();
      const process: t.RuntimeNodeProcessInfo = {
        tx,
        manifest: manifest ? { hash: manifest.hash, module: manifest.module } : undefined,
      };
      if (!manifest) {
        return done();
      }
      const entry = (options.entry || manifest.module.entry || '').trim().replace(/^\/*/, '');

      /**
       * Output log.
       */
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
        add('• hash.module', manifest.hash.module);
        add('• hash.files', manifest.hash.files);
        add('manifest ', Logger.format.url(bundle.url.href));
        add('size', `${yellow(size)} (${manifest.files.length} files)`);

        log.info();
        table.log();
        Logger.hr().newline();
      }

      /**
       * Execute the code (within "sandbox" VM).
       */
      lifecycle.fire(process, 'started');
      const res = await invoke({
        tx,
        bus,
        manifest,
        dir: bundle.cache.dir,
        silent,
        in: options.in,
        timeout,
        entry,
        fileshash,
        stdlibs,
        forceCache: isPullRequired,
      });
      elapsed = res.elapsed;
      res.errors.forEach((err) => addError(err.message, err.stack));

      // Finish up.
      return done({ out: res.out });
    });

    /**
     * Decorate return promise with additional context.
     */
    const res = promise as t.RuntimeRunPromise;
    res.tx = tx;
    res.lifecyle$ = lifecycle.$.pipe(
      takeUntil(done$),
      filter((e) => e.process.tx === tx),
      map(({ stage }) => ({ stage, is: events.is.lifecycle(stage) })),
    );
    res.start$ = res.lifecyle$.pipe(filter((e) => e.stage === 'started'));
    res.end$ = res.lifecyle$.pipe(filter((e) => e.is.ended));

    // Finish up.
    return res;
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
