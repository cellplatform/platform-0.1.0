/**
 * See:
 *  - https://github.com/graphql/graphiql
 */
import '../../styles';

import * as React from 'react';
import { Subject } from 'rxjs';
import { share, map, takeUntil, filter } from 'rxjs/operators';

import { constants, css, GlamorValue, hjson, t } from '../../common';
import { GraphqlEditorEvent } from './types';
import { graphqlFetcher } from './fetch';
import { DEFAULT_MESSAGE } from './default';

const GraphiQL = require('graphiql');

export type IGraphqlEditorProps = {
  url?: string;
  style?: GlamorValue;
  events$?: Subject<GraphqlEditorEvent>;
};
export type IGraphqlEditorState = {};

export class GraphqlEditor extends React.PureComponent<IGraphqlEditorProps, IGraphqlEditorState> {
  public state: IGraphqlEditorState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<IGraphqlEditorState>>();

  private _result: t.Json | undefined;
  private _schema: t.Json | undefined;
  private _events$ = new Subject<GraphqlEditorEvent>();
  public events$ = this._events$.pipe(
    takeUntil(this.unmounted$),
    share(),
  );

  private graphiql!: any;
  private graphiqlRef = (ref: any) => (this.graphiql = ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));

    // Bubble events to parent.
    if (this.props.events$) {
      this.events$.subscribe(this.props.events$);
    }

    const events$ = this.events$.pipe(takeUntil(this.unmounted$));
    events$
      // Store the latest JSON result.
      .pipe(
        filter(e => e.type === 'GRAPHQL_EDITOR/fetched'),
        map(e => e.payload as t.IGraphqlEditorFetched),
      )
      .subscribe(e => {
        this._result = e.result;
        const data = e.result.data;
        const fetchId = e.fetchId;
        const schema = data ? ((data as any).__schema as t.Json) : undefined;
        const { url } = this.props;
        if (url && schema) {
          this._schema = schema;
          this.fire({ type: 'GRAPHQL_EDITOR/fetched/schema', payload: { fetchId, url, schema } });
        }
      });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Properties]
   */
  public get result() {
    return this._result;
  }

  public get schema() {
    return this._schema;
  }

  public get query() {
    return this.editor.query.getValue();
  }
  public set query(text: string) {
    text = GraphqlEditor.prettify(text, 'GRAPHQL');
    this.editor.query.setValue(text);
  }

  public get variables() {
    return this.editor.variable.getValue();
  }
  public set variables(text: string) {
    text = GraphqlEditor.prettify(text, 'JSON');
    this.editor.variable.setValue(text);
  }

  public get editor() {
    const graphiql = this.graphiql;
    return {
      get query() {
        return graphiql.getQueryEditor() as CodeMirror.Editor;
      },
      get variable() {
        return graphiql.getVariableEditor() as CodeMirror.Editor;
      },
    };
  }

  private get fetcher() {
    const { url = `${window.location.origin}/graphql` } = this.props;
    const events$ = this._events$;
    return graphqlFetcher({ url, events$ });
  }

  /**
   * [Methods]
   */
  public run(selectedOperationName?: string) {
    this.graphiql.handleRunQuery(selectedOperationName);
  }

  public prettify() {
    this.query = GraphqlEditor.prettify(this.query, 'GRAPHQL');
    this.variables = GraphqlEditor.prettify(this.variables, 'JSON');
    this.fire({
      type: 'GRAPHQL_EDITOR/prettified',
      payload: { query: this.query, variables: this.variables },
    });
  }

  public static prettify(text: string, type: 'GRAPHQL' | 'JSON') {
    if (!text.trim()) {
      return text;
    }
    switch (type) {
      case 'GRAPHQL':
        const { parse, print } = require('graphql');
        return print(parse(text));
      case 'JSON':
        const obj = hjson.parse(text);
        return hjson.stringify(obj, { quotes: 'all', separator: true });
    }
    return text;
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        position: 'relative',
        flex: 1,
      }),
      logo: css({ display: 'none' }),
    };
    return (
      <div {...css(styles.base, this.props.style)} className={constants.CSS.ROOT}>
        <GraphiQL
          ref={this.graphiqlRef}
          fetcher={this.fetcher}
          editorTheme={'nord'}
          defaultQuery={DEFAULT_MESSAGE}
          onEditQuery={this.handleEditQuery}
          onEditVariables={this.handleEditVariables}
          onEditOperationName={this.handleEditOperationName}
          onToggleDocs={this.handleToggleDocs}
        >
          <GraphiQL.Logo>
            <div {...styles.logo} />
          </GraphiQL.Logo>
          <GraphiQL.Toolbar>
            <GraphiQL.Button
              label={'Pretty'}
              title={'Prettify Query (Shift-Ctrl-P)'}
              onClick={this.handlePrettify}
            />
          </GraphiQL.Toolbar>
        </GraphiQL>
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private fire = (e: GraphqlEditorEvent) => this._events$.next(e);

  private handlePrettify = () => this.prettify();

  private handleEditQuery = (query: string) => {
    this.fire({
      type: 'GRAPHQL_EDITOR/changed/query',
      payload: { query, variables: this.variables },
    });
  };

  private handleEditVariables = (variables: string) => {
    this.fire({
      type: 'GRAPHQL_EDITOR/changed/variables',
      payload: { variables, query: this.query },
    });
  };

  private handleEditOperationName = (name: string) => {
    this.fire({
      type: 'GRAPHQL_EDITOR/changed/operationName',
      payload: {
        name,
        query: this.query,
        variables: this.variables,
      },
    });
  };

  private handleToggleDocs = (isVisible: boolean) => {
    this.fire({ type: 'GRAPHQL_EDITOR/docs/toggled', payload: { isVisible } });
  };
}
