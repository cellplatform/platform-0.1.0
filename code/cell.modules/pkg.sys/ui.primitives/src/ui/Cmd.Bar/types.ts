import * as t from '../../common/types';

type Id = string;

export type CmdBarInstance = { bus: t.EventBus<any>; id: Id };

/**
 * <Component>
 */
export type CmdBarProps = {
  instance: t.CmdBarInstance;
  cornerRadius?: [number, number, number, number];
  backgroundColor?: string | number;
  text?: string;
  textbox?: {
    placeholder?: string;
    spinning?: boolean;
    pending?: boolean;
    flex?: number;
  };
  tray?: JSX.Element;
  style?: t.CssValue;
  onChange?: t.CmdTextboxChangeEventHandler;
  onAction?: t.CmdTextboxActionEventHandler;
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
  text: {
    changed$: t.Observable<CmdBarTextChange>;
    change(text: string): void;
    focus(): void;
    blur(): void;
    select(): void;
    cursor: { start(): void; end(): void };
  };
};

/**
 * [EVENT] Definitions
 */
export type CmdBarEvent = CmdBarActionEvent | CmdBarTextChangeEvent;

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

/**
 * Fires when the textbox changes.
 */
export type CmdBarTextChangeEvent = {
  type: 'sys.ui.CmdBar/TextChanged';
  payload: CmdBarTextChange;
};
export type CmdBarTextChange = { instance: Id; text: string };
