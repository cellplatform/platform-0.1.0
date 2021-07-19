import { micro, t } from '../common';

/**
 * Make common checks before a request is
 * passed to the router.
 */
export function beforeRequest(args: { authorize?: t.HttpAuthorize }) {
  const { authorize } = args;

  return (e: micro.MicroRequest) => {
    /**
     * Check authorization rules.
     */
    if (authorize) {
      e.modify(async () => {
        const auth = toAuthObject(await authorize(e));
        const ok = auth.status.toString().startsWith('2');
        if (ok) return {};

        const { status, message: error } = auth;
        return { response: { status, data: { status, error } } };
      });
    }
  };
}

/**
 * Helpers
 */

function toAuthObject(input: t.HttpAuthorizeResponse): { status: number; message?: string } {
  if (input === true) return { status: 200 };
  if (typeof input === 'object') return input;
  if (typeof input === 'number') return { status: input };
  return { status: 403, message: 'Forbidden' };
}
