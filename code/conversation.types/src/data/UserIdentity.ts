import { t, UNNAMED, value } from '../common';

/**
 * Helpers for working with the `IUserIdentity` type.
 */
export class UserIdentity {
  public static UNNAMED = UNNAMED;

  public static toName(user?: t.IUserIdentity) {
    return user ? user.name || user.email || user.id : UNNAMED;
  }

  public static toEmail(user?: t.IUserIdentity) {
    const EMPTY = '';
    if (!user) {
      return EMPTY;
    }
    if (user.email) {
      return user.email;
    }
    const name = UserIdentity.toName(user);
    return value.isEmail(name) ? name : EMPTY;
  }
}
