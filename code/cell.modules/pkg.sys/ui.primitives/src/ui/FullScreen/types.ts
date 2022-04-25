import * as t from '../../common/types';

type Id = string;
type Milliseconds = number;

export type FullscreenInstance = { bus: t.EventBus<any>; id: string };

/**
 * EVENTS (API)
 */
export type FullscreenEvents = t.Disposable & {
  instance: { bus: Id; id: Id };
  $: t.Observable<FullscreenEvent>;
  enter: {
    req$: t.Observable<FullscreenEnterReq>;
    res$: t.Observable<FullscreenEnterReq>;
    fire(options?: { timeout?: Milliseconds }): Promise<FullscreenEnterRes>;
  };
  exit: {
    req$: t.Observable<FullscreenExitReq>;
    res$: t.Observable<FullscreenExitReq>;
    fire(options?: { timeout?: Milliseconds }): Promise<FullscreenExitRes>;
  };
};

/**
 * EVENTS (DEF)
 */

export type FullscreenEvent =
  | FullscreenEnterReqEvent
  | FullscreenEnterResEvent
  | FullscreenExitReqEvent
  | FullscreenExitResEvent;

/**
 * Enter fullscreen mode.
 */
export type FullscreenEnterReqEvent = {
  type: 'sys.ui.Fullscreen/enter:req';
  payload: FullscreenEnterReq;
};
export type FullscreenEnterReq = { tx: string; instance: Id };

export type FullscreenEnterResEvent = {
  type: 'sys.ui.Fullscreen/enter:res';
  payload: FullscreenEnterRes;
};
export type FullscreenEnterRes = { tx: string; instance: Id; error?: string };

/**
 * Exit fullscreen mode.
 */
export type FullscreenExitReqEvent = {
  type: 'sys.ui.Fullscreen/exit:req';
  payload: FullscreenExitReq;
};
export type FullscreenExitReq = { tx: string; instance: Id };

export type FullscreenExitResEvent = {
  type: 'sys.ui.Fullscreen/exit:res';
  payload: FullscreenExitRes;
};
export type FullscreenExitRes = { tx: string; instance: Id; error?: string };
