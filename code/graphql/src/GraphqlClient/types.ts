import { Observable } from 'rxjs';
import {
  ApolloQueryResult,
  OperationVariables,
  QueryOptions,
  MutationOptions,
} from 'apollo-client';
import { FetchResult } from 'apollo-link';

export type IGqlVariables = OperationVariables;

export type IGqlQueryOptions<V> = QueryOptions<V>;
export type IGqlQueryResult<D> = ApolloQueryResult<D>;

export type IGqlMutateOptions<D, V> = MutationOptions<D, V>;
export type IGqlMutateResult<D> = FetchResult<D>;

export type IGqlClient = {
  readonly dispose$: Observable<{}>;
  readonly isDisposed: boolean;
  dispose(): void;
  query<D = any, V = IGqlVariables>(req: IGqlQueryOptions<V>): Promise<IGqlQueryResult<D>>;
  mutate<D = any, V = IGqlVariables>(req: IGqlMutateOptions<D, V>): Promise<IGqlMutateResult<D>>;
};

/**
 * [Events]
 */
export type GraphqlEvent =
  | IGqlQueryingEvent
  | IGqlQueryiedEvent
  | IGqlMutatingEvent
  | IGqlMutatedEvent;

/**
 * [event.Query]
 */
export type IGqlQueryingEvent<V = IGqlVariables> = {
  type: 'GRAPHQL/querying';
  payload: IGqlQuerying<V>;
};
export type IGqlQuerying<V = IGqlVariables> = {
  req: IGqlQueryOptions<V>;
};

export type IGqlQueryiedEvent<V = IGqlVariables> = {
  type: 'GRAPHQL/queried';
  payload: IGqlQueryied<V>;
};
export type IGqlQueryied<D = any, V = IGqlVariables> = {
  req: IGqlQueryOptions<V>;
  res: IGqlQueryResult<D>;
};

/**
 * [event.Mutate]
 */
export type IGqlMutatingEvent<D = any, V = IGqlVariables> = {
  type: 'GRAPHQL/mutating';
  payload: IGqlMutating<D, V>;
};
export type IGqlMutating<D = any, V = IGqlVariables> = {
  req: IGqlMutateOptions<D, V>;
};

export type IGqlMutatedEvent<D = any, V = IGqlVariables> = {
  type: 'GRAPHQL/mutated';
  payload: IGqlMutated<D, V>;
};
export type IGqlMutated<D = any, V = IGqlVariables> = {
  req: IGqlMutateOptions<D, V>;
  res: IGqlMutateResult<D>;
};
