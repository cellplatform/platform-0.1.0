import './styles';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, GlamorValue, graphqlFetcher, constants } from '../../common';

const GraphiQL = require('graphiql');

export type IGraphqlEditorProps = { style?: GlamorValue };
export type IGraphqlEditorState = {};

export class GraphqlEditor extends React.PureComponent<IGraphqlEditorProps, IGraphqlEditorState> {
  public state: IGraphqlEditorState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<IGraphqlEditorState>>();

  private graphiql!: any;
  private graphiqlRef = (ref: any) => (this.graphiql = ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
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
        <GraphiQL ref={this.graphiqlRef} fetcher={graphqlFetcher}>
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

  private handlePrettify = () => {
    const editor = this.graphiql.getQueryEditor();
    const currentText = editor.getValue();
    const { parse, print } = require('graphql');
    const prettyText = print(parse(currentText));
    editor.setValue(prettyText);
  };
}
