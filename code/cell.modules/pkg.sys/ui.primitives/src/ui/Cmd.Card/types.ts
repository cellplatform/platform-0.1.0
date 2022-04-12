import * as t from '../../common/types';

type O = Record<string, unknown>;
type Id = string;

export type CmdCardInstance = { bus: t.EventBus<any>; id: Id };
export type CmdCardStateInfoFields = 'Title' | 'State.Controller';
export type CmdCardPart = 'Body' | 'Backdrop';

/**
 * RENDER
 */
export type CmdCardRender<S extends O = O> = (props: CmdCardRenderProps<S>) => JSX.Element | null;
export type CmdCardRenderProps<S extends O> = {
  bus: t.EventBus<any>;
  card: t.CmdCardEvents;
  state: CmdCardRenderState<S>;
  size: t.DomRect;
};
export type CmdCardRenderState<S extends O> = {
  current: S;
  patch(fn: t.JsonMutation<S>): Promise<void>;
};

export type CmdCardRenderController = (args: CmdCardRenderControllerArgs) => void | (() => any); // NB. Disposer.
export type CmdCardRenderControllerArgs = {
  bus: t.EventBus<any>;
  card: t.CmdCardEvents;
};

/**
 * STATE
 */
export type CmdCardState<A extends O = any, B extends O = any> = {
  ready: boolean;
  commandbar: {
    text?: string;
    textbox: { pending: boolean; spinning: boolean; placeholder: string };
  };
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
 * CONTROLLER
 */
export type CmdCardControllerArgs = {
  instance: t.CmdCardInstance;
  initial?: t.CmdCardState | (() => t.CmdCardState);
  dispose$?: t.Observable<any>;
};

/**
 * EVENTS (API)
 */
export type CmdCardEventsArgs<A extends O, B extends O> = {
  instance: t.CmdCardInstance;
  dispose$?: t.Observable<any>;
  initial?: t.CmdCardState<A, B> | (() => t.CmdCardState<A, B>);
};

export type CmdCardEventsDisposable<A extends O = any, B extends O = any> = t.Disposable &
  CmdCardEvents<A, B> & {
    clone(): CmdCardEvents<A, B>;
  };

export type CmdCardEvents<A extends O = any, B extends O = any> = {
  readonly instance: { bus: Id; id: Id };
  readonly $: t.Observable<t.CmdCardEvent>;
  readonly dispose$: t.Observable<void>;
  readonly state: t.JsonState<CmdCardState<A, B>>;
};

/**
 * EVENT (Definitions)
 */
export type CmdCardEvent = CmdCardStateFOOEvent;

/**
 * Fires when the current state has changed.
 */
export type CmdCardStateFOOEvent = {
  type: 'sys.ui.CmdCard/___FOO___'; // TEMP 🐷
  payload: CmdCardStateFOO;
};
export type CmdCardStateFOO = {
  instance: Id;
  state: t.CmdCardState;
};
