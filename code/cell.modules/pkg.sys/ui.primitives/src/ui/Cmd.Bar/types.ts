import { Observable } from 'rxjs';
import * as t from '../../common/types';

type Id = string;
export type CmdBarInstance = { bus: t.EventBus<any>; id: Id };

/**
 * State
 */
export type CmdBarState = {
  history?: t.EventHistory;
  text?: string;
  spinning?: boolean;
};

/**
 * Event API.
 */
export type CmdBarEventsFactory = (args: {
  instance: CmdBarInstance;
  dispose$?: Observable<any>;
}) => CmdBarEvents;

export type CmdBarEvents = t.Disposable & {
  instance: { bus: Id; id: Id };
  $: Observable<CmdBarEvent>;
  action: {
    $: Observable<CmdBarAction>;
    fire(args: { text: string }): void;
  };
  text: {
    changed$: Observable<CmdBarTextChange>;
    changed(args: { from: string; to: string }): void;
  };
};

/**
 * EVENT Definitions
 */
export type CmdBarEvent = CmdBarActionEvent | CmdBarTextChangeEvent;

/**
 * Fires when the command is invoked.
 */
export type CmdBarActionEvent = {
  type: 'sys.ui.CmdBar/Action';
  payload: CmdBarAction;
};
export type CmdBarAction = { instance: Id; text: string };

/**
 * Fires when the textbox changes.
 */
export type CmdBarTextChangeEvent = {
  type: 'sys.ui.CmdBar/TextChanged';
  payload: CmdBarTextChange;
};
export type CmdBarTextChange = { instance: Id; from: string; to: string };
