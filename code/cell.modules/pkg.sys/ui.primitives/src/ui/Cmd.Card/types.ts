import * as t from '../../common/types';

type O = Record<string, unknown>;
type Id = string;

export type CmdCardInstance = { bus: t.EventBus<any>; id: Id };
export type CmdCardStateInfoFields = 'Title' | 'State.Controller';

/**
 * <Component>
 */
export type CmdCardProps = {
  instance: t.CmdCardInstance;
  tray?: JSX.Element;
  body?: JSX.Element;
  commandbar?: t.CmdCardCommandBar;
  showAsCard?: boolean;
  minimized?: boolean;
  style?: t.CssValue;
};

/**
 * STATE
 */
export type CmdCardState = {
  ready: boolean;
  commandbar: CmdCardCommandBar;
};

export type CmdCardCommandBar = {
  text?: string;
  textbox: { pending: boolean; spinning: boolean; placeholder: string };
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
    onExecuteCommand(fn: CmdCardExecuteCommandHandler): void;
  };
};

export type CmdCardExecuteCommandHandler = (e: CmdCardExecuteCommandArgs) => any;
export type CmdCardExecuteCommandArgs = {
  trigger: 'Key:Enter';
  text: string;
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
