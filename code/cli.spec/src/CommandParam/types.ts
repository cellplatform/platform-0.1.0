/**
 * A single parameter of a Command.
 */
export type ICommandParam = {
  type: CommandParamType;
  name: string;
  description: string;
  isEnum: boolean;
};

export type CommandParamType = 'string' | 'boolean' | 'number' | Array<string | boolean | number>;
