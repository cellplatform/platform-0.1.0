import { t } from '../common';

/**
 * Ensures the user is logged in.
 */
export const userRequired: t.IAuthPolicy = {
  name: 'AUTH/user/required',
  eval(auth) {
    auth.access(auth.user ? 'GRANT' : 'DENY');
  },
};
