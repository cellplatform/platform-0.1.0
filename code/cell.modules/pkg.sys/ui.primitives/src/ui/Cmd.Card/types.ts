import * as t from '../../common/types';

type O = Record<string, unknown>;
type Id = string;

export type CmdCardInstance = { bus: t.EventBus<any>; id: Id };
export type CmdCardStateInfoFields = 'Title' | 'State.Controller';
export type CmdCardPart = 'Body' | 'Backdrop';

export type CmdCardRender<S extends O = O> = (props: CmdCardRenderProps<S>) => JSX.Element | null;
export type CmdCardRenderProps<S extends O> = {
  bus: t.EventBus<any>;
  size: t.DomRect;
  card: t.CmdCardEvents;
  state: CmdCardRenderState<S>;
};
export type CmdCardRenderState<S extends O> = {
  current: S;
  patch(fn: t.JsonMutation<S>): Promise<void>;
};

/**
 * STATE
 */
export type CmdCardState = {
  commandbar: t.CmdBarState;
  body: CmdCardStateBody;
  backdrop: CmdCardStateBackdrop;
};

export type CmdCardStateBackdrop = {
  render: CmdCardRender<any>;
  state?: O;
};

export type CmdCardStateBody<S extends O = O> = {
  isOpen?: boolean; // TEMP 🐷
  show?: 'FullScreen' | 'CommandBar' | 'Hidden';
  render: CmdCardRender<any>;
  state?: O;
};

/**
 * EVENTS (API)
 */
export type CmdCardEventsFactory = (args: CmdCardEventsFactoryArgs) => CmdCardEventsDisposable;
export type CmdCardEventsFactoryArgs = {
  instance: CmdCardInstance;
  dispose$?: t.Observable<any>;
  initial?: t.CmdCardState | (() => t.CmdCardState);
};
export type CmdCardEventsDisposable = t.Disposable & CmdCardEvents;
export type CmdCardEvents = {
  instance: { bus: Id; id: Id };
  $: t.Observable<t.CmdCardEvent>;
  dispose$: t.Observable<void>;
  state$: t.Observable<t.CmdCardState>;
  state: t.JsonState<CmdCardState>;
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
