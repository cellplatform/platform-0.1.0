import * as t from './types';

/**
 * Ensures the user is logged in.
 */
export const userRequired: t.IAuthPolicy = {
  name: 'AUTH/user/required',
  eval(e) {
    e.done(e.user ? 'GRANT' : 'DENY');
  },
};
