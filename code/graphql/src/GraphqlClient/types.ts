import { Observable } from 'rxjs';
import {
  ApolloQueryResult,
  OperationVariables,
  QueryOptions,
  MutationOptions,
} from 'apollo-client';
import { FetchResult, Operation } from 'apollo-link';
import { GraphQLError, ExecutionResult } from 'graphql';
import { ServerError, ServerParseError } from 'apollo-link-http-common';

export type IGqlVariables = OperationVariables;

export type IGqlQueryOptions<V> = QueryOptions<V>;
export type IGqlQueryResult<D> = ApolloQueryResult<D>;

export type IGqlMutateOptions<D, V> = MutationOptions<D, V>;
export type IGqlMutateResult<D> = FetchResult<D>;

export type IGqlClient = {
  readonly dispose$: Observable<{}>;
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
export type GraphqlEvent =
  | IGqlErrorEvent
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
