import { t } from './common';

/**
 * Base authorization handler for a service.
 */
export const authorize: t.HttpAuthorize = async (e) => {
  console.log('SUDO Check');
  console.log('e.headers', e.headers);
  return true;
};
