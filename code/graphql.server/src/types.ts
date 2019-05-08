import { IAuthResult, AuthPolicy } from '@platform/auth/lib/types';

export * from '@platform/auth/lib/types';

/**
 * The common context object passed to resolvers.
 */
export type IGqlContext = {
  authorize(policy: AuthPolicy): Promise<IAuthResult>;
};
