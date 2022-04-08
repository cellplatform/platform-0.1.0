import * as t from '../../common/types';

type O = Record<string, unknown>;
type Id = string;

export type CmdCardInstance = { bus: t.EventBus<any>; id: Id };
export type CmdCardStateInfoFields = 'Title' | 'State.Controller';
export type CmdCardPart = 'Body' | 'Backdrop';

export type CmdCardRender<S extends O = O> = (props: CmdCardRenderProps<S>) => JSX.Element | null;
export type CmdCardRenderProps<S extends O> = {
  bus: t.EventBus<any>;
  card: t.CmdCardEventsSafe;
  state: CmdCardRenderState<S>;
  size: t.DomRect;
};
export type CmdCardRenderState<S extends O> = {
  current: S;
  patch(fn: t.JsonMutation<S>): Promise<void>;
};

/**
 * STATE
 */
export type CmdCardState<A extends O = any, B extends O = any> = {
  commandbar: t.CmdBarState;
  body: CmdCardStateBody<A>;
  backdrop: CmdCardStateBackdrop<B>;
};

export type CmdCardStateBackdrop<S extends O = any> = {
  render: CmdCardRender<S>;
  state: S;
};

export type CmdCardStateBody<S extends O = any> = {
  isOpen?: boolean; // TEMP 🐷
  show?: 'FullScreen' | 'CommandBar' | 'Hidden';
  render: CmdCardRender<S>;
  state: S;
};

/**
 * EVENTS (API)
 */
export type CmdCardEvents<A extends O = any, B extends O = any> = t.Disposable &
  CmdCardEventsSafe<A, B>;

export type CmdCardEventsSafe<A extends O = any, B extends O = any> = {
  readonly instance: { bus: Id; id: Id };
  readonly $: t.Observable<t.CmdCardEvent>;
  readonly dispose$: t.Observable<void>;
  readonly state: t.JsonState<CmdCardState<A, B>>;
  readonly state$: t.Observable<t.CmdCardState<A, B>>;
};

/**
 * EVENT (Definitions)
 */
export type CmdCardEvent = CmdCardStateChangedEvent;

/**
 * Retrieve the current state.
 */
export type CmdCardStateChangedEvent = {
  type: 'sys.ui.CmdCard/state:changed';
  payload: CmdCardStateChanged;
};
export type CmdCardStateChanged = {
  instance: Id;
  state: t.CmdCardState;
};
