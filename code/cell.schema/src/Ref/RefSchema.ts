import { RefLinks } from './RefLinks';

type IRefSchemaArgs = Record<string, unknown>; // 🐷 Placeholder type.

/**
 * Schema for a reference (link).
 */
export class RefSchema {
  public static links = RefLinks;

  /**
   * [Lifecycle]
   */
  public static create = (args: IRefSchemaArgs) => new RefSchema(args);
  private constructor(args: IRefSchemaArgs) {} // eslint-disable-line
}
