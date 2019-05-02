export type CommandArgsParamType = string | number | boolean;
export type ICommandArgsOptions = { [key: string]: CommandArgsParamType | undefined };

/**
 * Parsing `ARGV` strings.
 */
export type ICommandArgs<O extends ICommandArgsOptions = {}> = {
  params: CommandArgsParamType[];
  options: O;
};
