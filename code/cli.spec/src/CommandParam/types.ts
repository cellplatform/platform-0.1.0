/**
 * A single parameter of a Command.
 */
export type ICommandParam = {
  name: string;
  type: CommandParamType;
  isEnum: boolean;
};

export type CommandParamType = 'string' | 'boolean' | 'number' | Array<string | boolean | number>;
