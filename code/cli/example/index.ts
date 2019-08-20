#!/usr/bin/env node
import { log, yargs, cli } from './libs';

/**
 * Initialize.
 */
const app = cli.create('my-app');

/**
 * Configure.
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
    'foo',
    'Sample command',
    yargs => yargs,
    argv => {
      log.info();
      log.info('🐷  foo', argv);
      log.info();
    },
  );

/**
 * Run.
 */
app.run();
