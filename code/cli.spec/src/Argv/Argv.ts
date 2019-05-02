import { t, value } from '../common';
const minimist = require('minimist');

/**
 * Process command line `argument vectors` ["argv"].
 */
export class Argv {
  /**
   * Parse a input string into command line argument: [parameters] and [commands].
   */
  public static parse<P extends t.CommandArgsOptions = any>(text: string): t.ICommandArgs<P> {
    const params = minimist((text || '').split(' '));
    const commands = (params._ || [])
      .filter((e: any) => Boolean(e))
      .map((e: any) => value.toType(e));
    delete params._;
    Object.keys(params).forEach(key => (params[key] = value.toType(params[key])));
    return { params: commands, options: params };
  }
}
