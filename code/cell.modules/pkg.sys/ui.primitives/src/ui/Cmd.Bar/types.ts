import * as t from '../../common/types';

type Id = string;

export type CmdBarInstance = { bus: t.EventBus<any>; id: Id };

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
    change(args: { from: string; to: string }): void;
  };
  focus: {
    $: t.Observable<CmdBarFocus>;
    fire(isFocused?: boolean): void;
  };
};

/**
 * [EVENT] Definitions
 */
export type CmdBarEvent = CmdBarActionEvent | CmdBarTextChangeEvent | CmdBarFocusEvent;

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
export type CmdBarTextChange = { instance: Id; from: string; to: string };

/**
 * Fires when the textbox changes.
 */
export type CmdBarFocusEvent = {
  type: 'sys.ui.CmdBar/Focus';
  payload: CmdBarFocus;
};
export type CmdBarFocus = { instance: Id; focus: boolean };
