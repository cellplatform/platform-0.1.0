import { log } from '../server';

const HR = '━'.repeat(40);
const err = new Error('Foo');

log.info();
log.info.gray('NB: The following printed errors are sample output');
log.info.gray('    (info, warn, error) not actual errors thrown by the lib.');
log.info(HR);

log.info(err);
log.warn(err);
log.error(err);

log.info(HR);

log.info();
log.info('info');
log.warn('warn');
log.error('error');

log.info(`
colors:
  ${log.black('black')}
  ${log.blue('blue')}
  ${log.cyan('cyan')}
  ${log.gray('gray')}
  ${log.green('green')}
  ${log.magenta('magenta')}
  ${log.red('red')}
  ${log.white('white')}
  ${log.yellow('yellow')}
`);

log.info('object', { foo: 123, text: 'hello' });
log.info({ foo: 123, text: 'hello' });
log.info();

log
  .table({
    head: ['key', 'value'],
    colWidths: [10, 25],
  })
  .add(['foo', log.green(123)])
  .add([log.magenta('bar'), 456])
  .log();

log
  .table({
    head: ['key', 'value'],
    colWidths: [10, 25],
    border: false,
  })
  .add(['foo', log.green(123)])
  .add([log.magenta('bar'), 456])
  .log();

log.info();
log.group('Group name:', 123);
log.info.cyan('Line 1');
log.info.magenta('Line 2');
log.group('Another group');
log.info.yellow('Line 3');
log.groupEnd();
log.groupEnd();
log.info.green('Done\n');
