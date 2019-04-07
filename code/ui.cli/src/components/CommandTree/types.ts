export * from '@platform/ui.tree/lib/types';

/**
 * [Events]
 */
export type CommandTreeEvent = IFooEvent;

export type IFooEvent = {
  type: 'COMMAND_TREE/foo';
  payload: {};
};
