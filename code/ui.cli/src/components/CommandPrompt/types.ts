import { t } from '../../common';
export * from '../CommandPromptInput/types';

export type ICommandPromptKeyMap = {
  focus: string | boolean;
};

/**
 * [Events]
 */
export type CommandPromptEvent = t.CommandStateEvent | ICommandAutoCompletedEvent;

export type ICommandAutoCompletedEvent = {
  type: 'COMMAND_PROMPT/autoCompleted';
  payload: t.ICommandAutoCompleted;
};
