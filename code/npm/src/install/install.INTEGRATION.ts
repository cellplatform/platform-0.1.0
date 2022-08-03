import { Npm, log, Subject, t } from '../test';

describe.skip('install (integration)', function () {
  this.timeout(100000);

  it('npm.install', async () => {
    await Npm.fs.remove(Npm.fs.resolve('./test/install/node_modules'));
    const events$ = new Subject<t.INpmInstallEvent>();

    events$.subscribe({
      next: (e) => log.info(e, '\n'),
      error: (err) => log.error(err),
      complete: () => log.info.cyan('COMPLETE'),
    });

    const res = await Npm.install({
      //  use: 'NPM'
      dir: './test/install',
      events$,
    });

    //   // installing.events$.subscribe(e => log.info(e));
    // const res = await installing.promise;
    log.info.cyan('----------------------------------------------------------');
    log.info(res);
  });
});
