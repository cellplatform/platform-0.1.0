import { ICommand } from '@platform/cli.spec/lib/types';

export * from '@platform/cli.spec/lib/types';

/**
 * [Events]
 */
export type CommandClickEvent = {
  cmd: ICommand;
};
export type CommandClickEventHandler = (e: CommandClickEvent) => void;
