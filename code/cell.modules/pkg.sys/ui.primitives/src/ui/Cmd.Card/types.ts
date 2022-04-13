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
export type CmdCardState = {
  ready: boolean;
  commandbar: {
    text?: string;
    textbox: { pending: boolean; spinning: boolean; placeholder: string };
  };
  body: CmdCardStateBody;
  backdrop: CmdCardStateBackdrop;
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
export type CmdCardEventsArgs = {
  instance: t.CmdCardInstance;
  dispose$?: t.Observable<any>;
  initial?: t.CmdCardState | (() => t.CmdCardState);
};

export type CmdCardEventsDisposable = t.Disposable & CmdCardEvents & { clone(): CmdCardEvents };
export type CmdCardEvents = {
  instance: { bus: Id; id: Id };
  $: t.Observable<t.CmdCardEvent>;
  dispose$: t.Observable<void>;
  state: t.JsonState<CmdCardState>;
  commandbar: {
    focus(): void;
    blur(): void;
    select(): void;
    cursor: { start(): void; end(): void };
  };
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
