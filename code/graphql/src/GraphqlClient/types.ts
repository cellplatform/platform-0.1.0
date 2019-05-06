import { Observable } from 'rxjs';

import { ApolloQueryResult, OperationVariables, QueryOptions } from 'apollo-client';
export type IGqlVariables = OperationVariables;
export type IGqlQueryOptions<V> = QueryOptions<V>;
export type IGqlQueryResult<D> = ApolloQueryResult<D>;

export type IGqlClient = {
  readonly dispose$: Observable<{}>;
  readonly isDisposed: boolean;
  dispose(): void;
  query<D = any, V = IGqlVariables>(req: IGqlQueryOptions<V>): Promise<IGqlQueryResult<D>>;
};

/**
 * [Events]
 */
export type GraphqlEvent = IGqlQueryingEvent | IGqlQueryiedEvent;

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
