import { Json } from '../../types';

/**
 * [Events]
 */

export type GraphqlEditorEvent =
  | IGraphqlEditorQueryChangedEvent
  | IGraphqlEditorOperationNameChangedEvent
  | IGraphqlEditorVariablesChangedEvent
  | IGraphqlEditorPrettifiedEvent
  | IGraphqlEditorDocsToggledEvent
  | IGraphqlEditorFetchingEvent
  | IGraphqlEditorFetchedEvent
  | IGraphqlEditorFetchErrorEvent
  | IGraphqlEditorSchemaFetchedEvent;

export type IGraphqlEditorQueryChangedEvent = {
  type: 'GRAPHQL_EDITOR/changed/query';
  payload: { query: string; variables: string };
};

export type IGraphqlEditorVariablesChangedEvent = {
  type: 'GRAPHQL_EDITOR/changed/variables';
  payload: { query: string; variables: string };
};

export type IGraphqlEditorOperationNameChangedEvent = {
  type: 'GRAPHQL_EDITOR/changed/operationName';
  payload: { name: string; query: string; variables: string };
};

export type IGraphqlEditorPrettifiedEvent = {
  type: 'GRAPHQL_EDITOR/prettified';
  payload: { query: string; variables: string };
};

export type IGraphqlEditorDocsToggledEvent = {
  type: 'GRAPHQL_EDITOR/docs/toggled';
  payload: { isVisible: boolean };
};

export type IGraphqlEditorFetchingEvent = {
  type: 'GRAPHQL_EDITOR/fetching';
  payload: IGraphqlEditorFetching;
};
export type IGraphqlEditorFetching = {
  fetchId: string;
  url: string;
  params: object;
  isCancelled: boolean;
  cancel(): void;
};

export type IGraphqlEditorFetchedEvent = {
  type: 'GRAPHQL_EDITOR/fetched';
  payload: IGraphqlEditorFetched;
};
export type IGraphqlEditorFetched = {
  fetchId: string;
  url: string;
  params: object;
  result: Json;
  isError: boolean;
};

export type IGraphqlEditorSchemaFetchedEvent = {
  type: 'GRAPHQL_EDITOR/fetched/schema';
  payload: { url: string; schema: Json };
};

export type IGraphqlEditorFetchErrorEvent = {
  type: 'GRAPHQL_EDITOR/fetch/error';
  payload: { fetchId: string; url: string; params: object; error: Error };
};
