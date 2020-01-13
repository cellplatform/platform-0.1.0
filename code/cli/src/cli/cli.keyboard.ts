import { Observable } from 'rxjs';
import { share, filter, map } from 'rxjs/operators';

import { t } from '../common';

/**
 * Initialises the keyboard for interactive input.
 */
export function initKeyboard(args: {
  fire: t.FireEvent;
  exit: t.CmdAppExit;
  events$: Observable<t.CmdAppEvent>;
}) {
  const { fire, exit } = args;

  const events$ = args.events$.pipe(
    filter(e => e.type.startsWith('CLI/keyboard')),
    map(e => e as t.CmdAppKeyboardEvent),
  );

  const res: t.ICmdKeyboard = {
    events$,
    started$: events$.pipe(
      filter(e => e.type === 'CLI/keyboard/started'),
      map(e => e.payload as t.ICmdAppKeyboardStarted),
      share(),
    ),
    keypress$: events$.pipe(
      filter(e => e.type === 'CLI/keyboard/keypress'),
      map(e => e.payload as t.ICmdAppKeypress),
      share(),
    ),
  };

  // Prepare low-level keyboard stream reader.
  import('readline').then(e => {
    if (process.stdin.setRawMode) {
      process.stdin.setRawMode(true);
    }
    e.emitKeypressEvents(process.stdin);
    fire({ type: 'CLI/keyboard/started', payload: {} });

    process.stdin.on('keypress', (text, data) => {
      // Alert listeners.
      const { ctrl, meta, shift, sequence } = data;
      const key = data.name;
      const payload: t.ICmdAppKeypress = { key, sequence, ctrl, meta, shift };
      fire({ type: 'CLI/keyboard/keypress', payload });

      // Exit if the "cancel" key sequence is sent.
      if (payload.key === 'c' && payload.ctrl) {
        exit(0);
      }
    });
  });

  // Finish up.
  return res;
}
