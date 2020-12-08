import { log, logger, t, time, fs, defaultValue, R } from '../common';
import { NodeVM } from 'vm2';
import { Script } from '../vm';

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
  dir: string;
  manifest: t.BundleManifest;
  entry?: string;
  in?: Partial<t.RuntimeIn>;
  silent?: boolean;
  timeout?: number;
  hash?: string;
}) {
  return new Promise<R>(async (resolve) => {
    const { silent, manifest, dir } = args;
    const entry = (args.entry || manifest.entry || '').trim();

    /**
     * TODO 🐷
     * - return value: type
     * - piping (chain of functions) - i
     * - builtin: policy security
     * - env.import() =>> from another cell.
     * - bundle: multiple entries
     * -
     */

    let ok = true;
    let isStopped = false;
    const errors: Error[] = [];
    const addError = (msg: string) => errors.push(new Error(msg));

    const elapsed = { prep: -1, run: -1 };
    const timer = time.timer();
    const timeout = defaultValue(args.timeout, 3000);
    const timeoutDelay = time.delay(timeout, () => {
      addError(`Execution timed out (max ${timeout}ms)`);
      done();
    });

    const prepComplete = () => {
      elapsed.prep = timer.elapsed.msec;
      timer.reset(); // NB: Restart timer to get a read on the "running" execution time.
    };

    const headers: t.RuntimePipeInfoHeaders = { contentType: 'application/json' };
    const out: t.RuntimeOut = {
      value: undefined,
      info: { headers },
    };

    const done = (value?: t.Json) => {
      timeoutDelay.cancel();
      if (isStopped) {
        return; // NB: The [done] response can only be returned once.
      }
      isStopped = true;

      elapsed.run = timer.elapsed.msec;
      ok = !ok ? false : errors.length === 0;
      if (!args.silent) {
        const status = ok ? log.green('ok') : log.red('fail');
        log.info();
        log.info.gray(`status: ${status} (${elapsed.prep + elapsed.run} ms)`);
        logger.errors(errors);
      }

      resolve({
        ok,
        out: { ...out, value },
        errors,
        elapsed,
      });
    };

    if (args.hash && args.hash !== manifest.hash) {
      addError(`Bundle manifest does not match requested hash '${args.hash}'.`);
      prepComplete();
      return done();
    }

    const env: t.GlobalEnv = {
      in: R.clone({
        value: args.in?.value || {},
        info: args.in?.info || { headers: { contentType: 'application/json' } },
      }),

      out: {
        done,
        contentType(mime) {
          headers.contentType = mime;
          return env.out;
        },
        contentTypeDef(uri) {
          headers.contentTypeDef = uri;
          return env.out;
        },
      },
    };

    const sandbox: t.Global = { env };

    try {
      const vm = new NodeVM({
        console: silent ? 'off' : 'inherit',
        sandbox,
        require: {
          external: true,
          // builtin: ['os', 'tty', 'util'],
          builtin: ['*'], // TEMP 🐷 - TODO allow only by policy
          root: './',
        },
      });

      const code = await Script.get(fs.join(dir, entry));
      prepComplete();
      vm.run(code.script);
    } catch (error) {
      ok = false;
      errors.push(error);
      done();
    }
  });
}
