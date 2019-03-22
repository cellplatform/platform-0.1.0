import { animationFrameScheduler } from 'rxjs';
import { observeOn, share } from 'rxjs/operators';

import { IWindowResizeEvent } from './types';
import { fromWindowEvent } from './util';

/**
 * [URL_Hash]
 */
export const hashChange$ = fromWindowEvent<HashChangeEvent>('hashchange');

/**
 * [Resize]
 */
export const resize$ = fromWindowEvent<IWindowResizeEvent>('resize').pipe(
  observeOn(animationFrameScheduler),
  share(),
);
