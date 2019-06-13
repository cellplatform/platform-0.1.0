import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { GraphqlEditor, GraphqlEditorEvent } from '../../src';
import { color, Button, css, GlamorValue, Hr, FormulaInput } from './common';

const VARIABLES = {
  DEFAULT: `
    {
      foo: 1234
      bar: hello
    }
  `,
};

export type ISample = {
  url: string;
  query: string;
};

const QUERY: { [key: string]: ISample } = {
  MARKET: {
    url: 'https://api.blocktap.io/graphql',
    query: `
      query foo {
        markets(filter: {baseSymbol: {_eq: "BTC"}, quoteSymbol: {_in: ["USD", "USDT", "USDC"]}}) {
          marketSymbol
          ohlcv(resolution: _1d, limit: 1)
        }
      }
  `,
  },
  COUNTRIES: {
    url: 'https://countries.trevorblades.com',
    query: `
      {
        continents {
          code
          name
          countries {
            name
            phone
            currency    
          }
        }
      }
    `,
  },
  STARWARS: {
    url: 'https://api.graphcms.com/simple/v1/swapi',
    query: `
      {
        allFilms {
          title
          planets {
            name
            terrain
          }
        }
      }
    `,
  },
};

export type ITestProps = { style?: GlamorValue };
export type ITestState = {
  url?: string;
  query?: string;
};

export class Test extends React.PureComponent<ITestProps, ITestState> {
  public state: ITestState = {};
  private unmounted$ = new Subject<{}>();
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

    this.setSample(QUERY.STARWARS);
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Methods]
   */
  public setSample(sample: ISample) {
    const { url, query } = sample;
    this.state$.next({ url, query });
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
          {this.button('query: btc markets', () => this.setSample(QUERY.MARKET))}
          {this.button('query: countries', () => this.setSample(QUERY.COUNTRIES))}
          {this.button('query: starwars', () => this.setSample(QUERY.STARWARS))}
          <Hr margin={5} />
          {this.button('variables: <empty>', () => (this.editor.variables = ''))}
          {this.button('variables: DEFAULT', () => (this.editor.variables = VARIABLES.DEFAULT))}
        </div>
        <div {...styles.right}>{this.renderEditor()}</div>
      </div>
    );
  }

  private button(title: string, handler?: () => void) {
    return <Button label={title} onClick={handler} block={true} />;
  }

  private renderEditor() {
    const { url } = this.state;
    const styles = {
      base: css({}),
      top: css({
        position: 'relative',
        Flex: 'horizontal-center',
        height: 40,
      }),
      topLeft: css({
        paddingLeft: 20,
        fontSize: 12,
        color: color.format(-0.5),
        flex: 1,
      }),
      topRight: css({
        paddingRight: 20,
      }),
      editor: css({
        Absolute: [40, 20, 20, 20],
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.top}>
          <div {...styles.topLeft}>{url}</div>
          <div {...styles.topRight}>
            <FormulaInput value={'=IF(A1:B2, TRUE, FALSE) / 100'} />
          </div>
        </div>
        <GraphqlEditor
          ref={this.editorRef}
          url={url}
          query={this.state.query}
          events$={this.events$}
          style={styles.editor}
        />
      </div>
    );
  }
}
