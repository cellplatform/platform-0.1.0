export type AuthRole = string;

/**
 * Retrieve authorization details about whether a user
 * has access to a resource with the given policy.
 */
export type GetAuth<R = AuthRole, V = {}> = (request: IAuthRequest<V>) => Promise<IAuthResult<R>>;
export type IAuthRequest<V = {}> = {
  token: string;
  policy: IAuthPolicy;
  variables: V;
};

/**
 * Results of an authorization request.
 */
export type IAuthResult<R = AuthRole> = {
  isDenied: boolean;
  error?: Error;
  results: IPolicyResult[];
  user?: IAuthUser<R>;
  throw(message?: string): void;
};

export type IAuthUser<R = AuthRole> = {
  id: string;
  roles: R[];
};

/**
 * Authorization policy
 */
export type IAuthPolicy<V extends {} = any, R extends AuthRole = any> = {
  name: string;
  eval: AuthPolicyHandler<V, R>;
};

export type IAuthPolicies<V extends {} = any, R extends AuthRole = any> =
  | IAuthPolicy<V, R>
  | IAuthPolicy<V, R>[];

/**
 * An executable authorization policy.
 */
export type AuthPolicyHandler<V extends {}, R extends AuthRole> = (
  args: IAuthPolicyHandlerArgs<V, R>,
) => any | Promise<any>;

export type IAuthPolicyHandlerArgs<V extends {}, R extends AuthRole> = {
  readonly name: string;
  readonly isDenied: boolean;
  readonly user?: IAuthUser<R>;
  readonly variables: V;
  readonly result: IAuthResult<R>;
  access(value?: AuthAccess): IAuthPolicyHandlerArgs<V, R>;
  grant(): IAuthPolicyHandlerArgs<V, R>;
  deny(): IAuthPolicyHandlerArgs<V, R>;
  stop(err?: Error): IAuthPolicyHandlerArgs<V, R>;
};

export type IPolicyResult = {
  policy: string; // Policy "name".
  access?: AuthAccess; // NB: Undefined indicates inclusive determination from policy.
};

export type AuthAccess = 'GRANT' | 'DENY';
