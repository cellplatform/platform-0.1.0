export * from '@platform/ui.tree/lib/types';
import * as t from '../../types';

/**
 * [Events]
 */
export type CommandTreeEvent = ICommandTreeCurrentEvent;

export type ICommandTreeCurrentEvent = {
  type: 'COMMAND_TREE/current';
  payload: ICommandTreeCurrent;
};
export type ICommandTreeCurrent = {
  command?: t.ICommand;
};
