import { RefLinks } from './RefLinks';

type IRefSchemaArgs = {};

/**
 * Schema for a reference (link).
 */
export class RefSchema {
  public static links = RefLinks;

  /**
   * [Lifecycle]
   */
  public static create = (args: IRefSchemaArgs) => new RefSchema(args);
  private constructor(args: IRefSchemaArgs) {}
}
