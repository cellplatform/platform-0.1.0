import { Keyboard } from '@platform/react';
import { filter } from 'rxjs/operators';

export type KeyCommand = 'CONSOLE/clear';

/**
 * Manage keyboard.
 */
export function init() {
  const keyboard = Keyboard.create<KeyCommand>({
    bindings: [{ key: 'CMD+K', command: 'CONSOLE/clear' }],
  });
  const command$ = keyboard.bindingPress$;

  command$
    // Clear console handler.
    .pipe(
      filter(e => e.command === 'CONSOLE/clear'),
      filter(e => {
        // NB: If an <input> is focused it may have it's own [CMD+K] handler.
        const el = document.activeElement;
        return el ? el.tagName !== 'INPUT' : true;
      }),
    )
    .subscribe(e => {
      console.clear(); // tslint:disable-line
    });

  // Finish up.
  return keyboard;
}
