/**
 * [Events]
 */

export type GraphqlEditorEvent =
  | IGraphqlEditorQueryChanged
  | IGraphqlEditorOperationNameChanged
  | IGraphqlEditorVariablesChanged
  | IGraphqlEditorPrettified
  | IGraphqlEditorDocsToggled;

export type IGraphqlEditorQueryChanged = {
  type: 'GRAPHQL_EDITOR/changed/query';
  payload: { query: string; variables: string };
};

export type IGraphqlEditorVariablesChanged = {
  type: 'GRAPHQL_EDITOR/changed/variables';
  payload: { query: string; variables: string };
};

export type IGraphqlEditorOperationNameChanged = {
  type: 'GRAPHQL_EDITOR/changed/operationName';
  payload: { name: string; query: string; variables: string };
};

export type IGraphqlEditorPrettified = {
  type: 'GRAPHQL_EDITOR/prettified';
  payload: { query: string; variables: string };
};

export type IGraphqlEditorDocsToggled = {
  type: 'GRAPHQL_EDITOR/docs/toggled';
  payload: { isVisible: boolean };
};
