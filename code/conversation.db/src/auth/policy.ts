import { t } from '../common';

export const PERMISSION = {
  MSG_READ: 'MSG:read',
  MSG_WRITE: 'MSG:write',
};

export const POLICY = {
  THREAD: {
    READ: toPolicy(PERMISSION.MSG_READ),
    WRITE: toPolicy(PERMISSION.MSG_WRITE),
  },
};

/**
 * [Helpers]
 */
function toPolicy(...permissions: string[]): t.IPermissionPolicy {
  return { permissions };
}
