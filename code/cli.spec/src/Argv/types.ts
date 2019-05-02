export type CommandArgsParamType = string | number | boolean;

/**
 * Parsing `ARGV` strings.
 */
export type ICommandArgs<O extends object = {}> = {
  params: CommandArgsParamType[];
  options: O;
};
