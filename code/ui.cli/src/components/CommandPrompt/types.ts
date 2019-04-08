import { t } from '../../common';
export * from '../CommandPromptInput/types';

/**
 * [Events]
 */

export type CommandPromptEvent = t.CommandStateEvent | ICommandAutoCompletedEvent;

export type ICommandAutoCompletedEvent = {
  type: 'COMMAND_PROMPT/autoCompleted';
  payload: t.ICommandAutoCompleted;
};
