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

    if (args.hash && args.hash !== manifest.hash) {
      addError(`Bundle manifest does not match requested hash '${args.hash}'.`);
      prepComplete();
      return done();
    }

    const incoming = args.in || {};

    const env: t.NodeGlobalEnv = {
      in: { ...incoming, params: incoming.params || {} },
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
