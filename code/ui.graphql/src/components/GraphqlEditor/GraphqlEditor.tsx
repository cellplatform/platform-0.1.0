import './styles';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, GlamorValue, graphqlFetcher } from '../../common';

const GraphiQL = require('graphiql');

export type IGraphqlEditorProps = { style?: GlamorValue };
export type IGraphqlEditorState = {};

export class GraphqlEditor extends React.PureComponent<IGraphqlEditorProps, IGraphqlEditorState> {
  public state: IGraphqlEditorState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<IGraphqlEditorState>>();

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
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <GraphiQL fetcher={graphqlFetcher} />
      </div>
    );
  }
}

/**
 * [Helpers]
 */
