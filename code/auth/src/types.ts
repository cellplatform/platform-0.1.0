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
  | Array<IAuthPolicy<V, R>>;

/**
 * An executable authorization policy.
 */
export type AuthPolicyHandler<V extends {}, R extends AuthRole> = (
  args: IAuthEvalPolicyArgs<V, R>,
) => any | Promise<any>;

export type IAuthEvalPolicyArgs<V extends {}, R extends AuthRole> = {
  readonly name: string;
  readonly isDenied: boolean;
  readonly user?: IAuthUser<R>;
  readonly variables: V;
  readonly result: IAuthResult<R>;
  access(value?: AuthAccess): IAuthEvalPolicyArgs<V, R>;
  grant(): IAuthEvalPolicyArgs<V, R>;
  deny(): IAuthEvalPolicyArgs<V, R>;
  stop(): IAuthEvalPolicyArgs<V, R>;
};

export type IPolicyResult = {
  policy: string; // Policy "name".
  access?: AuthAccess; // NB: Undefined indicates inclusive determination from policy.
};

export type AuthAccess = 'GRANT' | 'DENY';
