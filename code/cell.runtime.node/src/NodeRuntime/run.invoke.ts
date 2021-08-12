import { R, DEFAULT, fs, log, Logger, t, time } from '../common';
import { Vm } from '../vm';

type R = {
  ok: boolean;
  out: t.RuntimeOut;
  errors: Error[];
  elapsed: t.RuntimeElapsed;
};

/**
 * Execute the bundle within the given directory.
 */
export function invoke(args: {
  tx: string;
  dir: string;
  manifest: t.ModuleManifest;
  bus: t.EventBus<any>;
  timeout: number;
  entry?: string;
  in?: Partial<t.RuntimeIn>;
  silent?: boolean;
  hash?: string;
  stdlibs?: t.RuntimeNodeAllowedStdlib[];
  forceCache?: boolean;
}) {
  return new Promise<R>(async (resolve) => {
    const { tx, silent, manifest, dir, stdlibs, timeout } = args;
    const entry = (args.entry || manifest.module.entry || '').trim();
    const filename = fs.join(dir, entry);
    const bus = args.bus;

    /**
     * TODO 🐷
     * - return value: def-type
     * - builtin: policy security
     * - env.import() =>> from another cell.
     * -
     */

    let ok = true;
    let isStopped = false;
    const errors: Error[] = [];
    const addError = (msg: string) => errors.push(new Error(msg));
    const onTimeout = () => {
      addError(`Execution timed out (max ${timeout}ms)`);
      done();
    };

    const elapsed = { prep: -1, run: -1 };
    const timer = time.timer();
    const timeoutDelay = timeout < 0 ? undefined : time.delay(timeout, onTimeout);

    const preparationComplete = () => {
      elapsed.prep = timer.elapsed.msec;
      timer.reset(); // NB: Restart timer to get a read on the "running" execution time.
    };

    const headers: t.RuntimeInfoHeaders = { ...DEFAULT.INFO.headers, ...args.in?.info?.headers };
    const out: t.RuntimeOut = {
      value: undefined,
      info: { ...args.in?.info, headers },
    };

    const done = (value?: t.Json) => {
      timeoutDelay?.cancel();
      if (isStopped) return; // NB: The [done] response can only be returned once.
      isStopped = true;

      elapsed.run = timer.elapsed.msec;
      ok = !ok ? false : errors.length === 0;
      if (!args.silent) {
        const status = ok ? log.green('ok') : log.red('fail');
        log.info();
        log.info.gray(`status: ${status} (${elapsed.prep + elapsed.run} ms)`);
        Logger.errors(errors);
      }

      resolve({
        ok,
        out: { ...out, value },
        errors,
        elapsed,
      });
    };

    if (args.hash && args.hash !== manifest.hash.files) {
      addError(`Bundle manifest does not match requested hash '${args.hash}'.`);
      preparationComplete();
      return done();
    }

    if (!(await fs.pathExists(filename))) {
      addError(`Entry file does not exist '${entry}'`);
      preparationComplete();
      return done();
    }

    const env: t.GlobalEnv = {
      tx,
      bus,

      in: R.clone({
        value: args.in?.value,
        info: args.in?.info || R.clone(DEFAULT.INFO),
      }),

      out: {
        done,
        contentType(mime) {
          headers.contentType = mime;
          return env.out;
        },
        contentDef(uri) {
          headers.contentDef = uri;
          return env.out;
        },
      },
    };

    const global: t.Global = { env };

    try {
      const vm = Vm.node({ silent, global, stdlibs });
      const code = await Vm.code(filename, { force: args.forceCache });

      preparationComplete(); // Stop the "preparation" timer.

      vm.run(code.script);
    } catch (error) {
      ok = false;
      errors.push(error);
      done();
    }
  });
}
