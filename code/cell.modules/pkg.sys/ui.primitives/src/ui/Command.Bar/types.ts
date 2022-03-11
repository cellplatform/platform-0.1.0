import { Disposable, EventBus } from '@platform/types';
import { Observable } from 'rxjs';

type Id = string;

/**
 * Event API.
 */
export type CommandBarEventsFactory = (args: {
  bus: EventBus<any>;
  instance: Id;
}) => CommandBarEvents;

export type CommandBarEvents = Disposable & {
  instance: Id;
  $: Observable<CommandBarEvent>;
  action: {
    $: Observable<CommandBarAction>;
    fire(args: { text: string }): void;
  };
  text: {
    changed$: Observable<CommandBarTextChange>;
    changed(args: { from: string; to: string }): void;
  };
};

/**
 * EVENT Definitions
 */
export type CommandBarEvent = CommandBarActionEvent | CommandBarTextChangeEvent;

/**
 * Fires when the command is invoked.
 */
export type CommandBarActionEvent = {
  type: 'sys.ui.CommandBar/Action';
  payload: CommandBarAction;
};
export type CommandBarAction = { instance: Id; text: string };

/**
 * Fires when the textbox changes.
 */
export type CommandBarTextChangeEvent = {
  type: 'sys.ui.CommandBar/TextChanged';
  payload: CommandBarTextChange;
};
export type CommandBarTextChange = { instance: Id; from: string; to: string };
