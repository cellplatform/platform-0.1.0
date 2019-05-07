import { t, UNNAMED } from '../common';

/**
 * Helpers for working with the `IUserIdentity` type.
 */
export class UserIdentity {
  public static toName(person?: t.IUserIdentity) {
    return person ? person.name || person.email || person.id : UNNAMED;
  }
}
