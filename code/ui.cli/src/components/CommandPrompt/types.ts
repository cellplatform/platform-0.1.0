import { t } from '../../common';
export * from '../CommandPromptInput/types';

/**
 * [Events]
 */

export type CommandPromptEvent = t.CommandStateEvent | ICommandAutoCompletedEvent;

export type ICommandAutoCompletedEvent = {
  type: 'COMMAND_PROMPT/autoCompleted';
  payload: ICommandAutoCompleted;
};

export type ICommandAutoCompleted = {
  index: number;
  text: { from: string; to: string };
  matches: string[];
};
