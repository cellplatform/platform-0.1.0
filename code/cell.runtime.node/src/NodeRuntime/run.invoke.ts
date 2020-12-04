import { log, logger, t, time, fs, defaultValue } from '../common';
import { NodeVM } from 'vm2';
import { Script } from '../vm';

type R = {
  ok: boolean;
  result?: t.Json;
  errors: Error[];
  elapsed: number;
};

/**
 * Execute the bundle within the given directory.
 */
export function invoke(args: {
  dir: string;
  manifest: t.BundleManifest;
  params?: t.Json;
  silent?: boolean;
  timeout?: number;
}) {
  return new Promise<R>(async (resolve, reject) => {
    const { silent, manifest, dir } = args;

    /**
     * TODO 🐷
     * - return value: type
     * - piping (chain of functions)
     * - allow imports (look at policy??)
     * - builtin
     * - env.import() =>> from another cell.
     */

    let ok = true;
    let isStopped = false;
    const errors: Error[] = [];

    const timer = time.timer();
    const timeout = defaultValue(args.timeout, 3000);
    const timeoutDelay = time.delay(timeout, () => {
      errors.push(new Error(`Execution timed out (max ${timeout}ms)`));
      done();
    });

    const done = (result?: t.Json) => {
      timeoutDelay.cancel();
      if (isStopped) {
        return; // NB: The [done] response can only be returned once.
      }
      isStopped = true;

      const elapsed = timer.elapsed;
      ok = !ok ? false : errors.length === 0;
      if (!args.silent) {
        const status = ok ? log.green('ok') : log.red('fail');
        log.info();
        log.info.gray(`status: ${status} (${elapsed.toString()})`);
        logger.errors(errors);
      }

      resolve({ ok, result, errors, elapsed: elapsed.msec });
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
      vm.run(code.script);
    } catch (error) {
      ok = false;
      errors.push(error);
      done();
    }
  });
}
