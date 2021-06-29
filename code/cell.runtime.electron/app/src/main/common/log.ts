import { create } from '@platform/log/lib/server';
import electron from 'electron-log';
import { filter, map } from 'rxjs/operators';

import { Uri, fs } from './libs';
import { ENV } from './constants';
import * as t from './types';

import { IServerLog } from '@platform/log/lib/server/types';
export type ElectronLog = IServerLog & { format: ElectronLogFormat };
export type ElectronLogFormat = {
  uri(input?: string | t.IUri): string;
  filepath(input?: string): string;
};

const logger = create();

const format: ElectronLogFormat = {
  uri(input?: string | t.IUri) {
    input = input || '';
    input = typeof input === 'string' ? input.trim() : input;
    if (!input) return logger.gray('<empty>');

    const parsed = Uri.parse(input.toString());
    const type = parsed.type;

    if (type === 'NS') {
      const uri = parsed.parts as t.INsUri;
      return log.gray(`${log.green('ns')}:${uri.id}`);
    }

    if (type === 'CELL' || type === 'ROW' || type === 'COLUMN') {
      const uri = parsed.parts as t.ICoordUri;
      return log.gray(`${log.green('cell')}:${uri.ns}:${log.green(uri.key)}`);
    }

    if (type === 'FILE') {
      const uri = parsed.parts as t.IFileUri;
      return log.gray(`${log.green('file')}:${uri.ns}:${log.green(uri.file)}`);
    }

    return log.gray(parsed.toString());
  },

  filepath(input?: string) {
    input = input || '';
    if (!input || typeof input !== 'string') return logger.gray('<empty>');
    const dir = fs.dirname(input);
    const basename = fs.basename(input);
    return log.gray(`${dir}/${log.white(basename)}`);
  },
};

/**
 * Create default log that writes to the console.
 */
export const log: ElectronLog = { ...logger, format };

/**
 * Write log events to the `electron-log` module.
 */
const events$ = log.events$.pipe(filter(() => !log.silent));
events$
  // Logging.
  .pipe(filter((e) => e.type === 'LOG'))
  .pipe(map((e) => e.payload as t.ILogEvent))
  .subscribe((e) => {
    if (ENV.isProd) electron.info(log.stripAnsi(e.output)); // NB: Color output stripped for external logfile.
    if (ENV.isDev) console.log(e.output);
  });

events$
  // Clear console.
  .pipe(filter((e) => e.type === 'CLEAR'))
  .subscribe((e) => console.clear()); // eslint-disable-line

events$
  // Group.
  .pipe(filter((e) => e.type === 'GROUP'))
  .pipe(map((e) => e.payload as t.ILogEvent))
  .subscribe((e) => console.group(e.output)); // eslint-disable-line

events$
  // End group.
  .pipe(filter((e) => e.type === 'UNGROUP'))
  .subscribe((e) => console.groupEnd()); // eslint-disable-line
