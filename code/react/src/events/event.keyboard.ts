import { map, merge, share } from 'rxjs/operators';
import { KeypressEvent, KeypressObservable } from './types';
import { fromDocumentEvent } from './util';

export * from './types';

const toKeypress = (e: KeyboardEvent, isPressed: boolean) => {
  const { key, code, altKey, ctrlKey, shiftKey, metaKey } = e;
  const isModifier = key === 'Meta' || key === 'Control' || key === 'Alt' || key === 'Shift';
  const event: KeypressEvent = {
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
