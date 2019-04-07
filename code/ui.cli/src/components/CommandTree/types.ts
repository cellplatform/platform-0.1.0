export * from '@platform/ui.tree/lib/types';
import * as t from '../../types';

/**
 * [Events]
 */
export type CommandTreeEvent = ICommandTreeCurrentEvent | ICommandTreeClickEvent;

export type ICommandTreeCurrentEvent = {
  type: 'COMMAND_TREE/current';
  payload: ICommandTreeCurrent;
};
export type ICommandTreeCurrent = {
  command?: t.ICommand;
};

export type ICommandTreeClickEvent = {
  type: 'COMMAND_TREE/click';
  payload: ICommandTreeClick;
};
export type ICommandTreeClick = {
  command: t.ICommand;
};
