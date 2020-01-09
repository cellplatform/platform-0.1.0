import { debounceTime, filter } from 'rxjs/operators';

import { log, watch, defaultValue, time, fs } from '../common';
import * as t from './types';

type IHistoryItem = {
  createdAt: number;
  response: t.IRunSyncResponse;
  log?: string;
};

/**
 * Sarts a file-watcher on the directory.
 */
export async function watchDir(args: {
  config: t.IFsConfigDir;
  silent: boolean;
  sync: t.RunSyncCurry;
  debounce?: number;
}) {
  const { config, silent, sync } = args;
  const debounce = defaultValue(args.debounce, 1000);
  let isStarted = false;

  const history: IHistoryItem[] = [];
  const appendHistory = (response: t.IRunSyncResponse) => {
    const MAX = 50;
    if (history.length === MAX) {
      history.shift();
    }

    const createdAt = time.now.timestamp;
    history.push({ createdAt, response });
  };

  const dir$ = watch.start({ pattern: `${config.dir}/*` }).events$.pipe(
    filter(e => e.isFile),
    filter(e => !e.name.startsWith('.')),
  );

  const logPage = (status?: string) => {
    log.clear();
    logHost(status);
    logHistory();
    log.info();
  };

  const logHost = (status?: string) => {
    status = status || 'listening';
    const uri = config.target.uri.parts;
    log.info.gray(`host:        ${config.data.host}`);
    log.info.gray(`target:      cell:${uri.ns}!${log.blue(uri.key)}`);
    log.info.gray(`status:      ${status}`);
    log.info();
  };

  const logDivider = () => {
    log.info.gray('-------------------------------------------');
  };

  const logHistory = (max: number = 5) => {
    const items = history.length < max ? history : history.slice(history.length - max);
    if (items.length > 0) {
      logDivider();
      const table = log.table({ border: false });
      items.forEach((item, i) => {
        const isLast = i === items.length - 1;
        item.log = item.log || toHistoryItem(item);
        const createdAt = time.day(item.createdAt).format('hh:mm:ss');
        const ts = log.gray(`[${isLast ? log.white(createdAt) : createdAt}]`);

        let line = item.log;
        if (!isLast) {
          const lines = line.split('\n');
          const suffix = log.gray(`...[${lines.length - 1}]`);
          line = `${lines[0]}`;
          line = lines.length < 2 ? line : `${line} ${suffix}`;
        }

        table.add([ts, line]);
      });
      log.info(table.toString());
    }
  };

  dir$.subscribe(async e => {
    if (!silent) {
      logPage(isStarted ? `pending` : `starting...`);
    }
  });

  dir$.pipe(debounceTime(debounce)).subscribe(async e => {
    logPage(log.yellow(isStarted ? `syncing...` : `starting...`));

    const res = await sync({ silent: true });
    isStarted = true;

    const { errors } = res;
    appendHistory(res);

    if (!silent) {
      logPage();
      if (errors.length > 0) {
        const errs = errors.map(item => item.error);
        log.info.yellow(`${log.yellow('•')} ${errs}`);
      }
    }
  });
}

/**
 * [Helpers]
 */

export function toHistoryItem(item: IHistoryItem) {
  const { results, bytes } = item.response;
  const { uploaded, deleted } = item.response.count;

  let output = '';
  if (uploaded > 0) {
    output = `uploaded (${fs.size.toString(bytes)})`;
    if (results.uploaded.length === 1) {
      output = `${output}: ${results.uploaded[0]}`;
    } else {
      const lines = results.uploaded.map(item => `  - ${item}`);
      output = `${output}:\n${lines.join('\n')}`;
    }
  }
  if (deleted > 0) {
    output = output ? `${output}\n` : output;
    output = `deleted`;
    if (results.deleted.length === 1) {
      output = `${output}: ${results.deleted[0]}`;
    } else {
      const lines = results.deleted.map(item => `  - ${item}`);
      output = `${output}:\n${lines.join('\n')}`;
    }
  }
  output = output.trim();

  if (output) {
    let bullet = log.cyan;
    if (uploaded > 0 && deleted > 0) {
      bullet = log.yellow;
    }
    if (uploaded > 0 && deleted === 0) {
      bullet = log.green;
    }
    if (uploaded === 0 && deleted > 0) {
      bullet = log.red;
    }
    output = `${bullet('•')} ${output}`;
  }

  output = output ? output : '• started';
  return log.gray(output);
}
