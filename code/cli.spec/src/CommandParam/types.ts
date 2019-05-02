import * as t from '../types';

export type CommandParamType = 'string' | 'boolean' | 'number' | t.CommandArgValue[];

/**
 * A single parameter of a Command.
 */
export type ICommandParam = {
  type: CommandParamType;
  name: string;
  description: string;
  isEnum: boolean;
};
