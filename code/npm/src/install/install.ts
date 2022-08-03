import { resolve } from 'path';
import { Subject } from 'rxjs';

import { exec, time, ITimer, value, t } from '../common';
import { yarn } from '../yarn';

/**
 * Runs an NPM or YARN install command.
 */
export async function install(
  args: {
    use?: t.Engine;
    dir?: string;
    silent?: boolean;
    events$?: Subject<t.INpmInstallEvent>;
    NPM_TOKEN?: string;
  } = {},
) {
  const timer = time.timer();
  const { events$, NPM_TOKEN } = args;
  const use = await toEngine(args.use);
  const dir = resolve(args.dir ? args.dir : '.');
  const cmd = await installCommand({ use });
  const silent = value.defaultValue(args.silent, true);

  let result: t.INpmInstallResult = {
    code: 0,
    success: true,
    elapsed: 0,
    engine: use,
    dir,
    info: [],
    errors: [],
  };

  const next = (type: t.INpmInstallEvent['type']) => {
    if (!events$) {
      return;
    }
    result = formatResult({ result, timer });
    const info = result.info[result.info.length - 1];
    const error = result.errors[result.errors.length - 1];
    events$.next({
      type,
      result,
      info,
      error,
    });
    if (type === 'COMPLETE') {
      events$.complete();
    }
  };

  const addError = (text: string) => {
    if (text) {
      const errors = [...result.errors, formatErrorLine(text)];
      result = { ...result, errors };
    }
  };

  const onData = (text: string, isError: boolean) => {
    text = formatInfoLine(text);
    isError = isErrorText(text) ? true : isError;
    if (isError) {
      text.split('\n').forEach((line) => addError(line));
    } else {
      result.info = [...result.info, text];
    }
    next(isError ? 'ERROR' : 'INFO');
  };

  // Run the command.
  const env = NPM_TOKEN ? { NPM_TOKEN } : undefined;
  const child = exec.cmd.run(`cd ${dir} \n ${cmd}`, { silent, env });
  child.stdout$.subscribe((e) => onData(e, false));
  child.stderr$.subscribe((e) => onData(e, false));

  // Finish up.
  await child;
  next('COMPLETE');
  return result;
}

/**
 * INTERNAL
 */

function formatInfoLine(text: string) {
  return text.replace(/\n$/, '').trim();
}

function formatErrorLine(text: string) {
  return text
    .replace(/^error/, '')
    .replace(/^ERROR:/, '')
    .replace(/\n$/, '')
    .trim();
}

function isErrorText(text: string) {
  return text.startsWith('ERROR:');
}

async function toEngine(use?: t.Engine) {
  if (use) {
    return use;
  }
  return (await yarn.isInstalled()) ? 'YARN' : 'NPM';
}

async function installCommand(args: { use: t.Engine }) {
  const use = await toEngine(args.use);
  switch (use) {
    case 'NPM':
      return 'npm install';
    case 'YARN':
      return 'yarn install';
    default:
      throw new Error(`Engine '${use}' not supported.`);
  }
}

function getExitCode(errors: string[]) {
  let code = 0;
  let fail = errors.find((line) => line.includes('failed with exit code'));
  if (fail) {
    fail = fail.replace(/\.$/, '');
    const parts = fail.split(' ');
    code = value.toNumber(parts[parts.length - 1]);
  }
  return code === 0 && errors.length > 0 ? 1 : code;
}

function formatResult(args: {
  result: t.INpmInstallResult;
  timer: ITimer;
  use?: t.Engine;
}): t.INpmInstallResult {
  const { timer, result } = args;
  const code = getExitCode(result.errors);
  const success = code === 0;
  const elapsed = timer.elapsed.msec;
  const engine = args.use || result.engine;
  return { ...result, code, success, elapsed, engine };
}
