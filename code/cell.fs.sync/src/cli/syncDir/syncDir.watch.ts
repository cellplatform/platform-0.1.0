import { debounceTime, filter } from 'rxjs/operators';

import { defaultValue, fs, log, time, watch, util } from '../common';
import * as t from './types';

type IHistoryItem = {
  index: number;
  createdAt: number;
  response: t.IRunSyncResponse;
  log?: string;
};

const EMPTY_SYNC_COUNT: t.ISyncCount = { total: 0, uploaded: 0, deleted: 0 };
const EMPTY_SYNC_RESPONSE: t.IRunSyncResponse = {
  ok: true,
  errors: [],
  count: EMPTY_SYNC_COUNT,
  bytes: -1,
  completed: true,
  results: { uploaded: [], deleted: [] },
};

const DIV = '-------------------------------------------------------';
const logDivider = () => log.info.gray(DIV);

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
  const debounce = defaultValue(args.debounce, 1500);
  let isStarted = false;
  const pattern = `${config.dir}/*`;
  const initialCount = (await fs.glob.find(pattern, { dot: false })).length;

  const history: IHistoryItem[] = [];
  const appendHistory = (response: t.IRunSyncResponse) => {
    const MAX = 50;
    if (history.length === MAX) {
      history.shift();
    }
    const createdAt = time.now.timestamp;
    const index = history.length;
    history.push({ index, createdAt, response });
  };

  const dir$ = watch.start({ pattern }).events$.pipe(
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
    status = status || '<watching>';
    const isSyncing = status?.includes('syncing');
    const dirname = fs.basename(config.dir);
    const dir = `${fs.dirname(config.dir)}/${isSyncing ? log.yellow(dirname) : dirname}/`;
    const uri = config.target.uri;

    const cellColor: util.log.Color = !isStarted ? 'gray' : isSyncing ? 'yellow' : 'blue';
    const cellTitle = util.log.cellKeyBg(uri.parts.key, isSyncing ? 'yellow' : 'blue');

    const formatLength = (line: string, max: number) => {
      if (line.length <= max) {
        return line;
      } else {
        const ellipsis = '..';
        const index = line.length - (max + ellipsis.length - 2);
        line = line.substring(index);
        line = `${ellipsis}${line}`;
        return line;
      }
    };

    const table = log.table({ border: false });
    const add = (key: string, value: string = '') => {
      table.add([log.gray(key), '   ', log.gray(value)]);
    };

    log.info(cellTitle);
    log.info();
    add('status:', status);
    add('local:', formatLength(dir, 40));
    add('remote:');
    add('  host:', config.data.host.replace(/\/*$/, ''));
    add('  target:', util.log.cellUri(uri, cellColor));

    log.info(table.toString());
    log.info();
    logDivider();
  };

  const logHistory = (max: number = 5) => {
    const items = history.length < max ? history : history.slice(history.length - max);
    if (items.length > 0) {
      const table = log.table({ border: false });
      items.forEach((item, i) => {
        const isLast = i === items.length - 1;
        item.log = item.log || toHistoryItem(item);
        const createdAt = time.day(item.createdAt).format('hh:mm:ss');
        const number = item.index + 1;
        const ts = log.gray(`${number} [${isLast ? log.white(createdAt) : createdAt}]`);

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
      logPage(isStarted ? `pending changes` : `starting`);
    }
  });

  dir$.pipe(debounceTime(debounce)).subscribe(async e => {
    logPage(isStarted ? log.yellow(`syncing`) : `starting`);

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

  // Draw the initial log page if the folder is empty.
  // NB:
  //    If there are items in the folder, then the page will be drawn
  //    via the normal "change" handlers.
  if (initialCount === 0) {
    isStarted = true;
    appendHistory(EMPTY_SYNC_RESPONSE);
    logPage();
  }
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
