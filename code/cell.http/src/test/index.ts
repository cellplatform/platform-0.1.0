import * as nock from 'nock';

export { nock };
export { expect, expectError } from '@platform/test';
export * from '../server/common';

/**
 * Helpers
 */

export const mock = {
  DOMAIN: 'https://domain.com',
  server: (domain?: string) => nock(domain || mock.DOMAIN),
  url: (path: string) => `${mock.DOMAIN}/${path.replace(/^\/*/, '')}`,
};
