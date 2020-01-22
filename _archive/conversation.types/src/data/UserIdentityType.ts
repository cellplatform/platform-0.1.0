import { R, t, UNNAMED, value } from '../common';

/**
 * Helpers for working with the `IUserIdentity` type.
 */
export class UserIdentityType {
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
    const name = UserIdentityType.toName(user);
    return value.isEmail(name) ? name : EMPTY;
  }

  public static insert(user: t.IUserIdentity, users: t.IUserIdentity[]) {
    return UserIdentityType.uniq([...users, user]);
  }

  public static uniq(users: t.IUserIdentity[]) {
    return R.uniqBy<t.IUserIdentity, any>(R.prop('id'), users);
  }
}
