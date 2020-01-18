#!/usr/bin/env node
import { filter } from 'rxjs/operators';
import { chalk, cli, log, time } from './libs';
import * as plugins from './plugins';

/**
 * Initialize.
 */
const app = cli.create('my-app');

/**
 * Show title before [Help] is displayed.
 * NB: This is done when no command is passed to the app.
 */
app.events$.pipe(filter(e => e.type === 'CLI/showHelp/before')).subscribe(() => {
  log.info(chalk.bgCyan.black(` My Title `));
  log.info();
});

/**
 * Configure.
 *
 * NB:  This is simple/direct "Yargs" style configuration.
 *      If the command-line is pulling commands from multiple sub-modules
 *      consider using the the [plugins] helper.
 */
app
  .command(
    ['init', 'i'],
    'Initialize the thing.',
    yargs =>
      yargs.option('force', {
        alias: 'f',
        describe: 'Overwrite existing files.',
        boolean: true,
      }),
    argv => {
      const { force } = argv;
      log.info();
      log.info('🌼  init', argv);
      log.info();
    },
  )
  .command(
    'tasks',
    'Sample spinning task list',
    yargs => yargs,
    async argv => {
      log.info();
      log.info('🐷  foo', argv);
      log.info();

      const res = await app
        .task('sync', () => true)
        .task('wait', async e => time.wait(1200))
        .task('wait/done', async e => {
          await time.wait(500);
          e.done();
          e.done();
          e.done();
        })
        .task('fail (via exception)', async e => {
          await time.wait(500);
          throw new Error('My error message');
        })
        .task('fail (via e.error)', async e => {
          await time.wait(800);
          e.error('Fail message');
        })
        .task('messages', async e => {
          const items = Array.from({ length: 5 }).map((v, i) => i + 1);
          for (const item of items) {
            e.message(`Message ${item}`);
            await time.wait(800);
          }
        })
        .task('immediate message', async e => {
          e.message('lorem ipsum dolar sit amet...');
          await time.wait(2500);
        })
        .run({ concurrent: true, silent: false, exitOnError: false });

      log.info.gray('\n-------------------------------------------');
      log.info('res', res);
      log.info();

      app.exit(res.code);
    },
  )
  .command(
    'list',
    'Prompt: list',
    yargs => yargs,
    async argv => {
      const res = await cli.prompt.list({
        message: 'my list',
        items: ['one', { name: 'two', value: 2 }, '---', 'three'],
      });
      log.info('-------------------------------------------');
      log.info('result: ', res);
      log.info();
    },
  );

/**
 * Run.
 */

plugins.init(app.plugins);
app.run();
