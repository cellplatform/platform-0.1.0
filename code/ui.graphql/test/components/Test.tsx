import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { GraphqlEditor, GraphqlEditorEvent } from '../../src';
import { color, Button, css, GlamorValue, Hr, constants } from './common';

const URL = {
  BLOCKTAP: 'https://api.blocktap.io/graphql',
  COUNTRIES: 'https://countries.trevorblades.com',
};
const DEFAULT = {
  QUERY_MARKET: `
    query foo {
      markets(filter: {baseSymbol: {_eq: "BTC"}, quoteSymbol: {_in: ["USD", "USDT", "USDC"]}}) {
        marketSymbol
        ohlcv(resolution: _1d, limit: 1)
      }
    }
  `,
  QUERY_COUNTRIES: `
    {
      continents {
        countries {
          name
          phone
          currency    
        }
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
export type ITestState = {
  url?: string;
};

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
   * [Methods]
   */
  public set(query: string, url: string) {
    this.editor.query = query;
    this.state$.next({ url });
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
    };

    return (
      <div {...styles.base}>
        <div {...styles.left}>
          {this.button('run', () => this.editor.run())}
          {this.button('data (console)', () => {
            console.group('🌳 data');
            console.log(' - result', this.editor.result);
            console.log(' - schema', this.editor.schema);
            console.groupEnd();
          })}
          <Hr margin={5} />
          {this.button('query: <empty>', () => (this.editor.query = ''))}
          {this.button('query: btc markets', () => this.set(DEFAULT.QUERY_MARKET, URL.BLOCKTAP))}
          {this.button('query: countries', () => this.set(DEFAULT.QUERY_COUNTRIES, URL.COUNTRIES))}
          <Hr margin={5} />
          {this.button('variables: <empty>', () => (this.editor.variables = ''))}
          {this.button('variables: DEFAULT', () => (this.editor.variables = DEFAULT.VARIABLES))}
        </div>
        <div {...styles.right}>{this.renderEditor()}</div>
      </div>
    );
  }

  private button(title: string, handler?: () => void) {
    return <Button label={title} onClick={handler} block={true} />;
  }

  private renderEditor() {
    const { url = URL.COUNTRIES } = this.state;
    const styles = {
      base: css({}),
      url: css({
        margin: 20,
        marginTop: 13,
        fontSize: 12,
        color: color.format(-0.5),
      }),
      editor: css({
        Absolute: [40, 20, 20, 20],
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.url}>{url}</div>
        <GraphqlEditor
          ref={this.editorRef}
          url={url}
          events$={this.events$}
          style={styles.editor}
        />
      </div>
    );
  }
}
