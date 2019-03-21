import { animationFrameScheduler } from 'rxjs';
import { observeOn, share } from 'rxjs/operators';
import { fromWindowEvent } from './util';

export * from './types';

export const hashChange$ = fromWindowEvent<HashChangeEvent>('hashchange');

export const resize$ = fromWindowEvent<{}>('resize').pipe(
  observeOn(animationFrameScheduler),
  share(),
);
