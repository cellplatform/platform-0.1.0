export type Role = string;
export type Permission = string;

/**
 * Authorization Policies
 * - permissions
 * - resource/attributes (future)
 */
export type AuthPolicy = IPermissionPolicy;
export type IPermissionPolicy<P = Permission> = { permissions: P[] };

/**
 * Retrieve authorization details about whether a user is
 * has access to a resource with the given permissions.
 */
export type GetAuth = (request: IAuthRequest) => Promise<IAuthResponse>;
export type IAuthRequest = {
  token: string;
  policy: AuthPolicy;
};

/**
 * Results of an authorization request.
 */
export type IAuthResponse<P = Permission, R = Role> = {
  isAllowed: boolean;
  matches: IAuthMatch<P, R>;
  user?: { id: string };
};

export type IAuthMatch<P = Permission, R = Role> = {
  permission: P;
  role: R;
  access: 'GRANT' | 'DENY';
};
