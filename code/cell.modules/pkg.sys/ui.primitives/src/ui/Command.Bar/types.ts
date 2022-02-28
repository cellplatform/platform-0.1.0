import { Disposable, EventBus } from '@platform/types';
import { Observable } from 'rxjs';

type InstanceId = string;

/**
 * Event API.
 */
export type CommandBarEventsFactory = (args: {
  bus: EventBus<any>;
  instance: InstanceId;
}) => CommandBarEvents;

export type CommandBarEvents = Disposable & {
  instance: InstanceId;
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
export type CommandBarAction = { instance: InstanceId; text: string };

/**
 * Fires when the textbox changes.
 */
export type CommandBarTextChangeEvent = {
  type: 'sys.ui.CommandBar/TextChanged';
  payload: CommandBarTextChange;
};
export type CommandBarTextChange = { instance: InstanceId; from: string; to: string };
