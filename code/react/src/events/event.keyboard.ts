import { map, merge, share } from 'rxjs/operators';

import { IKeypressEvent, KeypressObservable } from './types';
import { fromDocumentEvent } from './util';

export const toKeypress = (e: KeyboardEvent, isPressed: boolean) => {
  const { key, code, altKey, ctrlKey, shiftKey, metaKey } = e;
  const isModifier = key === 'Meta' || key === 'Control' || key === 'Alt' || key === 'Shift';
  const event: IKeypressEvent = {
    event: e,
    isPressed,
    key,
    code,
    altKey,
    ctrlKey,
    shiftKey,
    metaKey,
    isModifier,
    preventDefault: () => e.preventDefault(),
    stopPropagation: () => e.stopPropagation(),
    stopImmediatePropagation: () => e.stopImmediatePropagation(),
  };
  return event;
};

export const keyDown$ = fromDocumentEvent<KeyboardEvent>('keydown').pipe(
  map(e => toKeypress(e, true)),
  share(),
);

export const keyUp$ = fromDocumentEvent<KeyboardEvent>('keyup').pipe(
  map(e => toKeypress(e, false)),
  share(),
);

export const keyPress$ = keyDown$.pipe(merge(keyUp$)) as KeypressObservable;
