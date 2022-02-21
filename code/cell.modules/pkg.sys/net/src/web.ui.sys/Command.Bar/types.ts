import * as t from '../../common/types';

type InstanceId = string;

export type CommandBarEvent = CommandBarActionEvent;

/**
 * TODO 🐷
 * - move to primitives
 */

export type CommandBarActionEvent = {
  type: 'sys.ui.CommandBar/Action';
  payload: CommandBarAction;
};
export type CommandBarAction = {
  instance: InstanceId;
  text: string;
};
