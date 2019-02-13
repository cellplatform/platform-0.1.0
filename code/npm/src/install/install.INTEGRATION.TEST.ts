import { resolve } from 'path';
import { Subject } from 'rxjs';

import { npm } from '..';
import { fs, log } from '../common';

describe('install (integration)', function() {
  this.timeout(20000);

  it.skip('npm.install', async () => {
    await fs.remove(resolve('./test/install/node_modules'));
    const events$ = new Subject<npm.INpmInstallEvent>();

    events$.subscribe({
      next: e => log.info(e, '\n'),
      error: err => log.error(err),
      complete: () => log.info.cyan('COMPLETE'),
    });

    const res = await npm.install({
      //  use: 'NPM'
      dir: './test/install',
      events$,
    });
    // installing.events$.subscribe(e => log.info(e));

    // const res = await installing.promise;
    log.info.cyan('----------------------------------------------------------');
    log.info(res);
  });
});
