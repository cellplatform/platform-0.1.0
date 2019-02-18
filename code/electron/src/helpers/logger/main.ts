import { fs } from '@platform/fs';
import { create as createLog, format, chalk } from '@platform/log/lib/server';
import { is } from '@platform/util.is';
import * as elog from 'electron-log';
import { filter, map } from 'rxjs/operators';

import { IpcClient, IpcIdentifier } from '../ipc/Client';
import * as t from './types';

import { time } from '@platform/util.value';

type ILogMetadata = { start: { dev: number; prod: number } };
type Env = 'prod' | 'dev';

type Ref = { log?: t.IMainLog };
const ref: Ref = {};

/**
 * Configure local logging on the [main] process.
 */
export function init(args: { ipc: IpcClient; dir: string }) {
  if (ref.log) {
    return ref.log;
  }
  const ipc = args.ipc as IpcClient<t.LoggerEvents>;

  // Derive log location and store it.
  const paths = getPaths({ dir: args.dir });
  const { dir, env } = paths;
  fs.ensureDirSync(dir);

  // Create the logger.
  const log = createLog() as t.IMainLog;
  log.paths = {
    dir,
    dev: paths.dev.path,
    prod: paths.prod.path,
  };
  ref.log = log;

  // Configure the file transport.
  elog.transports.file.format = '{h}:{i}:{s} {text}';
  elog.transports.file.file = env === 'prod' ? paths.prod.path : paths.dev.path;
  elog.transports.file.level = 'info';

  // Turn off console logging - handled below.
  elog.transports.console.level = false;

  const logToConsole = (...items: any) => console.log.apply(null, items); // tslint:disable-line
  const logToConsoleGray = (msg: string) => logToConsole(log.gray(msg));

  // Alert user of log location.
  const tailPath = (file: string, color?: boolean) => {
    file = color ? log.cyan(file) : file;
    return log.gray(`${dir}/${file}`);
  };
  const tailCommand = (file: string, color?: boolean) => {
    let msg = 'tail -f';
    msg = color ? log.white(msg) : msg;
    msg = `${msg} ${tailPath(file, color)}`;
    return log.gray(msg);
  };
  if (is.dev) {
    logToConsole();
    logToConsoleGray(`logs | ${tailCommand(paths.dev.filename, true)}`);
    logToConsoleGray(`               ${tailPath(paths.prod.filename)}`);
    logToConsole();
  }

  // Write events to logs.
  const write = (sender: IpcIdentifier, level: t.LogLevel, output: string) => {
    const prefix = toPrefix(log, process);
    elog[level](prefix, output);
    // if (is.dev && process === 'MAIN') {
    //   // NB:  Don't worry about writing VIEW renderer logs to the console
    //   //      This is handled by the base [@platform/log].
    // }
    logToConsole(prefix, output);
  };

  // Pass log events to the electron-log.
  log.events$
    .pipe(
      filter(() => !log.silent),
      filter(e => e.type === 'LOG'),
      map(e => e.payload as t.ILogEvent),
    )
    .subscribe(e => {
      write({ id: 0, process: 'MAIN' }, e.level, e.output);
    });

  // Listen for log events from the [renderer] process
  // and write them to the log.
  ipc.events$
    .pipe(
      filter(e => e.type === '@platform/LOG/write'),
      filter(e => e.sender.process === 'RENDERER'),
      // map(e => e.payload),
    )
    .subscribe(e => {
      // e.sender
      write(e.sender, e.payload.level, format(e.payload));
    });

  // Insert a "startup" divider into log to visually chunk into sessions.
  const count = increment({ dir, env });
  const div = () => {
    let msg = `(${log.blue(count)})`;
    msg = `------------------------------------------------------ ${msg}`;
    msg = log.gray(msg);
    return msg;
  };
  elog.info('');
  elog.info(log.gray(`${time.day().format('D MMM YYYY')} [${env}]`));
  elog.info(div());
  elog.info('');

  // Finish up.
  return log;
}

/**
 * Derives paths for the logger.
 */
export function getPaths(args: { dir: string }) {
  const IS_DEV = is.dev;
  const env: Env = IS_DEV ? 'dev' : 'prod';
  const dir = args.dir;
  const file = {
    dev: 'dev.log',
    prod: 'prod.log',
  };

  const dev = {
    filename: file.dev,
    path: fs.join(dir, file.dev),
  };
  const prod = {
    filename: file.prod,
    path: fs.join(dir, file.prod),
  };

  return { env, dir, dev, prod };
}

/**
 * INTERNAL
 */
function increment(args: { dir: string; env: 'dev' | 'prod' }) {
  const read = () => {
    const DEFAULT: ILogMetadata = { start: { dev: 0, prod: 0 } };
    try {
      return fs.pathExistsSync(path) ? (fs.readJsonSync(path) as ILogMetadata) : DEFAULT;
    } catch (error) {
      return DEFAULT;
    }
  };
  const { dir, env } = args;
  const path = fs.join(dir, 'meta.json');
  const data = read();
  data.start[env] += 1;
  fs.writeFileSync(path, JSON.stringify(data, null, '  '));
  return data.start[env];
}

const toPrefix = (sender: IpcIdentifier) => {
  const { id, process } = sender;
  const isMain = process === 'MAIN';
  let prefix = isMain ? 'MAIN' : 'VIEW';
  prefix = `${prefix}-${id}`;
  prefix = `${prefix} ‣`;
  prefix = `${prefix}      `.substr(0, 6);
  prefix = isMain ? chalk.green(prefix) : chalk.magenta(prefix);
  return prefix;
};
