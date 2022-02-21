type InstanceId = string;

export type CommandBarEvent = CommandBarActionEvent;

export type CommandBarActionEvent = {
  type: 'sys.ui.CommandBar/Action';
  payload: CommandBarAction;
};
export type CommandBarAction = {
  instance: InstanceId;
  text: string;
};
