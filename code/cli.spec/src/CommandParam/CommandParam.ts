import { ICommandParam } from './types';

export type ICommandParamArgs = {
  name: ICommandParam['name'];
  type?: ICommandParam['type'];
  description?: ICommandParam['description'];
};

/**
 * Presents a single [parameter] of a Command.
 */
export class CommandParam implements ICommandParam {
  /**
   * [Static]
   */
  public static create(args: ICommandParamArgs) {
    return new CommandParam(args);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: ICommandParamArgs) {
    const name = (args.name || '').trim();

    if (!name.trim()) {
      throw new Error(`A parameter 'name' must be specified.`);
    }

    this.name = name;
    this.type = args.type || 'string';
    this.description = (args.description || '').trim();
  }

  /**
   * [Fields]
   */
  public readonly name: ICommandParam['name'];
  public readonly type: ICommandParam['type'];
  public readonly description: ICommandParam['description'];

  /**
   * [Properties]
   */
  public get isEnum() {
    return Array.isArray(this.type);
  }
}
