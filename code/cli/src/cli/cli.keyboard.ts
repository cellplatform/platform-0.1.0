import { t } from '../common';

/**
 * Initialises the keyboard for interactive input.
 */
export async function initKeyboardEvents(args: { fire: t.FireEvent; exit: t.Exit }) {
  if (process.stdin.setRawMode) {
    process.stdin.setRawMode(true);
  }
  import('readline').then(e => {
    e.emitKeypressEvents(process.stdin);
    process.stdin.on('keypress', (text, data) => {
      // Alert listeners.
      const { ctrl, meta, shift, sequence } = data;
      const key = data.name;
      const payload: t.ICmdAppKeyboard = { key, sequence, ctrl, meta, shift };
      args.fire({
        type: 'CLI/keyboard',
        payload,
      });

      // Exit if the "cancel" key sequence is sent.
      if (payload.key === 'c' && payload.ctrl) {
        args.exit(0);
      }
    });
  });
}
