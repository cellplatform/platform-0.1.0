/**
 * Parsing `ARGV` strings.
 */
export type IParsedArgs<P extends object = any> = {
  commands: string[];
  params: P;
};
