console.log('document', document);

// import { filter, map } from 'rxjs/operators';

// // import { log } from './common';

// // log.info('from renderer');
// import { create } from '@platform/log/lib/client';

// const logger = require('electron-log');

// logger.info('from renderer');
// // logger.info

// export const log = create();

// /**
//  * Write log events to the `electron-log` module.
//  */
// const events$ = log.events$.pipe(filter(() => !log.silent));
// events$
//   // Logging.
//   .pipe(filter(e => e.type === 'LOG'))
//   .pipe(map(e => e.payload as t.ILogEvent))
//   .subscribe(e => logger.info(e.output));

// events$
//   // Clear console.
//   .pipe(filter(e => e.type === 'CLEAR'))
//   .subscribe(e => console.clear()); // tslint:disable-line

// events$
//   // Group.
//   .pipe(filter(e => e.type === 'GROUP'))
//   .pipe(map(e => e.payload as t.ILogEvent))
//   .subscribe(e => console.group(e.output)); // tslint:disable-line

// events$
//   // End group.
//   .pipe(filter(e => e.type === 'UNGROUP'))
//   .subscribe(e => console.groupEnd()); // tslint:disable-line
