import * as t from '../../common/types';

type Id = string;

export type CmdBarInstance = { bus: t.EventBus<any>; id: Id };

export type CmdBarStateChangeHandler = (e: CmdBarStateChangeHandlerArgs) => void;
export type CmdBarStateChangeHandlerArgs = { state: t.CmdBarState };

/**
 * <Component>
 */
export type CmdBarProps = {
  instance: t.CmdBarInstance;
  cornerRadius?: [number, number, number, number];
  backgroundColor?: string | number;
  text?: string;
  hint?: string;
  textbox?: { placeholder?: string; spinning?: boolean; pending?: boolean };
  tray?: JSX.Element;
  style?: t.CssValue;
  onChange?: t.CmdTextboxChangeEventHandler;
  onAction?: t.CmdTextboxActionEventHandler;
};

/**
 * State
 */
export type CmdBarState = {
  text: string;
  hint?: string;
  textbox: { pending: boolean; spinning: boolean; placeholder: string };
};

/**
 * [Event] API.
 */
export type CmdBarEventsFactory = (args: {
  instance: CmdBarInstance;
  dispose$?: t.Observable<any>;
}) => CmdBarEventsDisposable;

export type CmdBarEventsDisposable = t.Disposable & CmdBarEvents & { clone(): CmdBarEvents };
export type CmdBarEvents = {
  instance: { bus: Id; id: Id };
  $: t.Observable<CmdBarEvent>;
  dispose$: t.Observable<void>;
  action: {
    $: t.Observable<CmdBarAction>;
    fire(args: { text: string; kind: t.CmdTextboxActionKind }): void;
  };
  textbox: {
    focus(): void;
    blur(): void;
    select(): void;
    cursor: { start(): void; end(): void };
  };
  state: t.JsonLens<CmdBarState>;
};

/**
 * [EVENT] Definitions
 */
export type CmdBarEvent = CmdBarActionEvent;

/**
 * Fires when the command is invoked.
 */
export type CmdBarActionEvent = {
  type: 'sys.ui.CmdBar/Action';
  payload: CmdBarAction;
};
export type CmdBarAction = {
  instance: Id;
  text: string;
  kind: t.CmdTextboxActionKind;
};
