/**
 * Parsing `ARGV` strings.
 */
export type ICommandArgs<O extends object = any> = {
  params: Array<string | number | boolean>;
  options: O;
};
