import { log, logger, t, time, fs, defaultValue } from '../common';
import { NodeVM } from 'vm2';
import { Script } from '../vm';

type R = {
  ok: boolean;
  result?: t.JsonMap;
  errors: Error[];
  elapsed: t.RuntimeElapsed;
};

/**
 * Execute the bundle within the given directory.
 */
export function invoke(args: {
  dir: string;
  manifest: t.BundleManifest;
  params?: t.JsonMap;
  silent?: boolean;
  timeout?: number;
}) {
  return new Promise<R>(async (resolve, reject) => {
    const { silent, manifest, dir } = args;

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

    const elapsed = { prep: -1, run: -1 };

    const timer = time.timer();

    const timeout = defaultValue(args.timeout, 3000);
    const timeoutDelay = time.delay(timeout, () => {
      errors.push(new Error(`Execution timed out (max ${timeout}ms)`));
      done();
    });

    const done = (result?: t.JsonMap) => {
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

      resolve({ ok, result, errors, elapsed });
    };

    const env: t.NodeGlobalEnv = {
      entry: { params: args.params || {} },
      done,
    };

    const sandbox: t.NodeGlobal = { env };

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

      const filename = fs.join(dir, manifest.entry);
      const code = await Script.get(filename);
      elapsed.prep = timer.elapsed.msec;

      timer.reset(); // NB: Restart timer to get a read on the "running" execution time.
      vm.run(code.script);
    } catch (error) {
      ok = false;
      errors.push(error);
      done();
    }
  });
}
