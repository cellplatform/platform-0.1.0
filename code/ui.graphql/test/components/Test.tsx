import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { GraphqlEditor, GraphqlEditorEvent } from '../../src';
import { color, Button, css, GlamorValue, Hr } from './common';

const DEFAULT = {
  QUERY: `
    query foo {
      markets(filter: {baseSymbol: {_eq: "BTC"}, quoteSymbol: {_in: ["USD", "USDT", "USDC"]}}) {
        marketSymbol
        ohlcv(resolution: _1d, limit: 1)
      }
    }
  `,
  VARIABLES: `
    {
      foo: 1234
      bar: hello
    }
  `,
};

export type ITestProps = { style?: GlamorValue };
export type ITestState = {};

export class Test extends React.PureComponent<ITestProps, ITestState> {
  public state: ITestState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ITestState>>();
  private events$ = new Subject<GraphqlEditorEvent>();

  private editor!: GraphqlEditor;
  private editorRef = (ref: GraphqlEditor) => (this.editor = ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
    const events$ = this.events$.pipe(takeUntil(this.unmounted$));

    events$.subscribe(e => {
      console.log('🌳 EVENT', e);
    });
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
        Absolute: 0,
        display: 'flex',
      }),
      left: css({
        width: 180,
        backgroundColor: color.format(-0.04),
        borderRight: `solid 1px ${color.format(-0.1)}`,
        fontSize: 13,
        padding: 10,
        lineHeight: 1.8,
      }),
      right: css({
        flex: 1,
        position: 'relative',
      }),
      editor: css({
        Absolute: 20,
      }),
    };

    const url = `https://api.blocktap.io/graphql`;

    return (
      <div {...styles.base}>
        <div {...styles.left}>
          {this.button('data (console)', () => {
            console.group('🌳 data');
            console.log(' - result', this.editor.result);
            console.log(' - schema', this.editor.schema);
            console.groupEnd();
          })}
          <Hr margin={5} />
          {this.button('query: DEFAULT', () => (this.editor.query = DEFAULT.QUERY))}
          {this.button('query: <empty>', () => (this.editor.query = ''))}
          <Hr margin={5} />
          {this.button('variables: DEFAULT', () => (this.editor.variables = DEFAULT.VARIABLES))}
          {this.button('variables: <empty>', () => (this.editor.variables = ''))}
        </div>
        <div {...styles.right}>
          <GraphqlEditor
            ref={this.editorRef}
            url={url}
            events$={this.events$}
            style={styles.editor}
          />
        </div>
      </div>
    );
  }

  private button(title: string, handler?: () => void) {
    return <Button label={title} onClick={handler} block={true} />;
  }
}
