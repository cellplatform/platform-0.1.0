import { Observable } from 'rxjs';
import { share, filter, map } from 'rxjs/operators';
import * as readline from 'readline';

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
  const keypress$ = args.events$.pipe(
    filter(e => e.type === 'CLI/keypress'),
    map(e => e.payload as t.ICmdAppKeypress),
    share(),
  );
  const res: t.ICmdKeyboard = { keypress$ };

  // Prepare low-level keyboard stream reader.
  // readline.
  if (process.stdin.setRawMode) {
    process.stdin.setRawMode(true);
  }
  readline.emitKeypressEvents(process.stdin);
  process.stdin.on('keypress', (text, data) => {
    // Alert listeners.
    const { ctrl, meta, shift, sequence } = data;
    const key = data.name;
    const payload: t.ICmdAppKeypress = { key, sequence, ctrl, meta, shift };
    fire({ type: 'CLI/keypress', payload });

    // Exit if the "cancel" key sequence is sent.
    if (payload.key === 'c' && payload.ctrl) {
      exit(0);
    }
  });

  // Finish up.
  return res;
}
