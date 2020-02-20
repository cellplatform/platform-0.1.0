import { filter, map } from 'rxjs/operators';

import { t } from './common';
import { create } from './log.create';

/**
 * Create default log that writes to the console.
 */
export const log = create();
export default log;

/**
 * Write log events to the console.
 */
const events$ = log.events$.pipe(filter(() => !log.silent));
events$
  // Logging.
  .pipe(filter(e => e.type === 'LOG'))
  .pipe(map(e => e.payload as t.ILogEvent))
  .subscribe(e => console.log(e.output));

events$
  // Clear console.
  .pipe(filter(e => e.type === 'CLEAR'))
  .subscribe(e => console.clear());

events$
  // Group.
  .pipe(filter(e => e.type === 'GROUP'))
  .pipe(map(e => e.payload as t.ILogEvent))
  .subscribe(e => console.group(e.output));

events$
  // End group.
  .pipe(filter(e => e.type === 'UNGROUP'))
  .subscribe(e => console.groupEnd());
