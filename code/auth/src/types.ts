export type Role = string;
export type Permission = string;

/**
 * Authorization policies
 * - permissions
 * - resource/attributes (future)
 */
export type AuthPolicy = IPermissionPolicy;
export type IPermissionPolicy<P = Permission> = { permissions: P[] };

/**
 * Retrieve authorization details about whether a user
 * has access to a resource with the given policy.
 */
export type GetAuth = (request: IAuthRequest) => Promise<IAuthResult>;
export type IAuthRequest = {
  token: string;
  policy: AuthPolicy;
};

/**
 * Results of an authorization request.
 */
export type IAuthResult<P = Permission, R = Role> = {
  isAllowed: boolean;
  matches: Array<IAuthMatch<P, R>>;
  user?: { id: string };
  throw(message?: string): void;
};

export type IAuthMatch<P = Permission, R = Role> = {
  permission: P;
  role: R;
  access: 'GRANT' | 'DENY';
};
