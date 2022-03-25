import { Disposable, EventBus } from '@platform/types';
import { Observable } from 'rxjs';

type Id = string;

/**
 * Event API.
 */
export type CmdBarEventsFactory = (args: { bus: EventBus<any>; instance: Id }) => CmdBarEvents;

export type CmdBarEvents = Disposable & {
  bus: Id;
  instance: Id;
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
