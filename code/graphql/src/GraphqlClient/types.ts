import { Observable } from 'rxjs';
import {
  ApolloQueryResult,
  OperationVariables,
  QueryOptions,
  MutationOptions,
  FetchPolicy,
} from 'apollo-client';
import { FetchResult, Operation } from 'apollo-link';
import { GraphQLError, ExecutionResult } from 'graphql';
import { ServerError, ServerParseError } from 'apollo-link-http-common';

export type IGqlVariables = OperationVariables;

export type IGqlFetchPolicy = FetchPolicy;
export type IGqlQueryOptions<V> = QueryOptions<V>;
export type IGqlQueryResult<D> = ApolloQueryResult<D>;

export type IGqlMutateOptions<D, V> = MutationOptions<D, V>;
export type IGqlMutateResult<D> = FetchResult<D>;

export type IGqlClient = {
  readonly dispose$: Observable<{}>;
  readonly events$: Observable<GqlEvent>;
  readonly headers$: Observable<IGqlHttpHeaders>;
  readonly isDisposed: boolean;
  dispose(): void;
  query<D = any, V = IGqlVariables>(request: IGqlQueryOptions<V>): Promise<IGqlQueryResult<D>>;
  mutate<D = any, V = IGqlVariables>(
    request: IGqlMutateOptions<D, V>,
  ): Promise<IGqlMutateResult<D>>;
};

export type IHttpHeaders = { [key: string]: string | number };

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
  errors?: ReadonlyArray<GraphQLError>;
  network?: Error | ServerError | ServerParseError;
  response?: ExecutionResult;
  operation: Operation;
};

export type IGqlHttpHeadersEvent = {
  type: 'GRAPHQL/http/headers';
  payload: IGqlHttpHeaders;
};
export type IGqlHttpHeaders = {
  headers: { from: IHttpHeaders; to: IHttpHeaders };
  merge(headers: IHttpHeaders): IGqlHttpHeaders;
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
