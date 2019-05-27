import { t, is } from '../common';

/**
 * Runs a set of authorization policies.
 */
export async function authorize(args: {
  policy: t.IAuthPolicy | t.IAuthPolicy[];
  user?: t.IAuthUser;
  variables?: object;
  getError?: (message: string) => Error;
}) {
  const { user, variables = {}, getError } = args;
  const policies = Array.isArray(args.policy) ? args.policy : [args.policy];

  let result: t.IAuthResult = {
    isDenied: false,
    results: [],
    user,
    throw(message) {
      message = message || 'Not allowed.';
      const error = getError ? getError(message) : new Error(message);
      throw error;
    },
  };

  for (const policy of policies) {
    let isStopped = false;
    result = { ...result };
    const e: t.IAuthPolicyHandlerArgs<any, any> = {
      name: policy.name,
      user,
      variables,
      result,
      get isDenied() {
        return result.isDenied;
      },
      access(value?: t.AuthAccess) {
        const results = [...result.results, { access: value, policy: policy.name }];
        const isDenied = value !== undefined ? value === 'DENY' : result.isDenied;
        result = { ...result, isDenied, results };
        return this;
      },
      grant() {
        return e.access('GRANT');
      },
      deny() {
        return e.access('DENY');
      },
      stop(err: Error) {
        if (err) {
          result.error = err;
          result.isDenied = true;
        }
        isStopped = true;
        return this;
      },
    };

    // Execute the policy.
    try {
      await policy.eval(e);
    } catch (err) {
      let msg = `Failed while executing policy '${policy.name}'.`;
      msg = is.dev ? `${msg} ${err.message}` : msg; // NB: Don't surface inner error in production.
      e.stop(new Error(msg));
    }

    if (isStopped) {
      break;
    }
  }

  return result;
}
