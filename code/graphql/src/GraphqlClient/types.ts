import * as t from '../common/types';

export type IGqlVariables = t.OperationVariables;

export type IGqlFetchPolicy = t.FetchPolicy;
export type IGqlQueryOptions<V> = t.QueryOptions<V>;
export type IGqlQueryResult<D> = t.ApolloQueryResult<D>;

export type IGqlMutateOptions<D, V> = t.MutationOptions<D, V>;
export type IGqlMutateResult<D> = t.FetchResult<D>;

export type IGqlClient = {
  readonly dispose$: t.Observable<{}>;
  readonly events$: t.Observable<GqlEvent>;
  readonly headers$: t.Observable<IGqlHttpHeaders>;
  readonly isDisposed: boolean;
  dispose(): void;
  query<D = any, V = IGqlVariables>(request: IGqlQueryOptions<V>): Promise<IGqlQueryResult<D>>;
  mutate<D = any, V = IGqlVariables>(
    request: IGqlMutateOptions<D, V>,
  ): Promise<IGqlMutateResult<D>>;
};

/**
 * [Events]
 */
export type GqlEvent =
  | IGqlErrorEvent
  | IGqlHttpHeadersEvent
  | IGqlQueryingEvent
  | IGqlQueryiedEvent
  | IGqlMutatingEvent
  | IGqlMutatedEvent;

export type IGqlErrorEvent = {
  type: 'GRAPHQL/error';
  payload: IGqlError;
};
export type IGqlError = {
  total: number;
  errors?: ReadonlyArray<t.GraphQLError>;
  network?: Error | t.ServerError | t.ServerParseError;
  response?: t.ExecutionResult;
  operation: t.Operation;
};

export type IGqlHttpHeadersEvent = {
  type: 'GRAPHQL/http/headers';
  payload: IGqlHttpHeaders;
};
export type IGqlHttpHeaders = {
  headers: { from: t.IHttpHeaders; to: t.IHttpHeaders };
  merge(headers: t.IHttpHeaders): IGqlHttpHeaders;
  add(header: string, value?: string | number): IGqlHttpHeaders;
  auth(token?: string): IGqlHttpHeaders;
};

/**
 * [event.Query]
 */

export type IGqlQueryingEvent<V = IGqlVariables> = {
  type: 'GRAPHQL/querying';
  payload: IGqlQuerying<V>;
};
export type IGqlQuerying<V = IGqlVariables> = {
  request: IGqlQueryOptions<V>;
};

export type IGqlQueryiedEvent<V = IGqlVariables> = {
  type: 'GRAPHQL/queried';
  payload: IGqlQueryied<V>;
};
export type IGqlQueryied<D = any, V = IGqlVariables> = {
  request: IGqlQueryOptions<V>;
  response: IGqlQueryResult<D>;
};

/**
 * [event.Mutate]
 */
export type IGqlMutatingEvent<D = any, V = IGqlVariables> = {
  type: 'GRAPHQL/mutating';
  payload: IGqlMutating<D, V>;
};
export type IGqlMutating<D = any, V = IGqlVariables> = {
  request: IGqlMutateOptions<D, V>;
};

export type IGqlMutatedEvent<D = any, V = IGqlVariables> = {
  type: 'GRAPHQL/mutated';
  payload: IGqlMutated<D, V>;
};
export type IGqlMutated<D = any, V = IGqlVariables> = {
  request: IGqlMutateOptions<D, V>;
  response: IGqlMutateResult<D>;
};
