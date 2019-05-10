import * as t from './types';
import * as policy from './policy';

export { policy };
export * from './types';

/**
 * Authorizes the user.
 */
export async function authorize(args: {
  policy: t.IAuthPolicy | t.IAuthPolicy[];
  user?: t.IAuthUser;
  variables?: object;
  getError?: (message: string) => void;
}) {
  const { user, variables = {} } = args;
  const policies = Array.isArray(args.policy) ? args.policy : [args.policy];

  let result: t.IAuthResult = {
    isDenied: false,
    results: [],
    user,
    throw(message) {
      message = message || 'Now allowed.';
      const error = args.getError ? args.getError(message) : new Error(message);
      throw error;
    },
  };

  for (const policy of policies) {
    result = { ...result };
    await policy.eval({
      user,
      variables,
      result,
      get isDenied() {
        return result.isDenied;
      },
      done(access?: t.AuthAccess) {
        const results = [...result.results, { access, policy: policy.name }];
        const isDenied = access !== undefined ? access === 'DENY' : result.isDenied;
        result = { ...result, isDenied, results };
      },
    });
  }

  return result;
}
