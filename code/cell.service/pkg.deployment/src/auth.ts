import { t } from './common';

/**
 * Base authorization handler for a service.
 */
export const authorize: t.HttpAuthorize = async (e) => {
  console.log('TODO/SUDO Check. Headers:', e.headers);
  return true;
};
