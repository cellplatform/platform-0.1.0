import { IAuthResult, IAuthPolicy } from '@platform/auth/lib/types';

/**
 * The common context object passed to resolvers.
 */
export type IGqlContext<V extends {} = any> = {
  authorize(args: { policy: IAuthPolicy | IAuthPolicy[]; variables?: V }): Promise<IAuthResult>;
};
