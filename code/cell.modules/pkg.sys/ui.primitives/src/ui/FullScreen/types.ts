import { RefObject } from 'react';
import * as t from '../../common/types';

type Id = string;
type Milliseconds = number;

export type FullscreenInstance = { bus: t.EventBus<any>; id: string };

/**
 * API
 */
export type Fullscreen<H extends HTMLElement = HTMLDivElement> = {
  ref: RefObject<H>;
  isFullscreen: boolean;
  enter(): Promise<void>;
  exit(): Promise<void>;
  toggle(): Promise<{ from: boolean; to: boolean }>;
};

export type FullscreenStatus = {
  element: HTMLElement;
  isFullscreen: boolean;
};

/**
 * EVENTS (API)
 */
export type FullscreenEvents = t.Disposable & {
  instance: { bus: Id; id: Id };
  $: t.Observable<FullscreenEvent>;
  fire(e: t.FullscreenEvent): void;
  status: {
    req$: t.Observable<FullscreenStatusReq>;
    res$: t.Observable<FullscreenStatusRes>;
    get(options?: { timeout?: Milliseconds }): Promise<FullscreenStatusRes>;
  };
  enter: {
    req$: t.Observable<FullscreenEnterReq>;
    res$: t.Observable<FullscreenEnterRes>;
    fire(options?: { timeout?: Milliseconds }): Promise<FullscreenEnterRes>;
  };
  exit: {
    req$: t.Observable<FullscreenExitReq>;
    res$: t.Observable<FullscreenExitReq>;
    fire(options?: { timeout?: Milliseconds }): Promise<FullscreenExitRes>;
  };
  changed: {
    $: t.Observable<FullscreenChanged>;
    fire(isFullscreen: boolean): void;
  };
};

/**
 * EVENTS (DEF)
 */

export type FullscreenEvent =
  | FullscreenStatusReqEvent
  | FullscreenStatusResEvent
  | FullscreenEnterReqEvent
  | FullscreenEnterResEvent
  | FullscreenExitReqEvent
  | FullscreenExitResEvent
  | FullscreenChangedEvent;

/**
 * Enter fullscreen mode.
 */
export type FullscreenStatusReqEvent = {
  type: 'sys.ui.Fullscreen/Status:req';
  payload: FullscreenStatusReq;
};
export type FullscreenStatusReq = { tx: string; instance: Id };

export type FullscreenStatusResEvent = {
  type: 'sys.ui.Fullscreen/Status:res';
  payload: FullscreenStatusRes;
};
export type FullscreenStatusRes = {
  tx: string;
  instance: Id;
  status?: FullscreenStatus;
  error?: string;
};

/**
 * Enter fullscreen mode.
 */
export type FullscreenEnterReqEvent = {
  type: 'sys.ui.Fullscreen/Enter:req';
  payload: FullscreenEnterReq;
};
export type FullscreenEnterReq = { tx: string; instance: Id };

export type FullscreenEnterResEvent = {
  type: 'sys.ui.Fullscreen/Enter:res';
  payload: FullscreenEnterRes;
};
export type FullscreenEnterRes = { tx: string; instance: Id; error?: string };

/**
 * Exit fullscreen mode.
 */
export type FullscreenExitReqEvent = {
  type: 'sys.ui.Fullscreen/Exit:req';
  payload: FullscreenExitReq;
};
export type FullscreenExitReq = { tx: string; instance: Id };

export type FullscreenExitResEvent = {
  type: 'sys.ui.Fullscreen/Exit:res';
  payload: FullscreenExitRes;
};
export type FullscreenExitRes = { tx: string; instance: Id; error?: string };

/**
 * Fired when fullscreen mode changes
 */
export type FullscreenChangedEvent = {
  type: 'sys.ui.Fullscreen/Changed';
  payload: FullscreenChanged;
};
export type FullscreenChanged = {
  instance: Id;
  isFullscreen: boolean;
};
