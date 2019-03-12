import * as React from 'react';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { color, COLORS, css, GlamorValue, t } from '../common';
import { Editor } from './Editor';
import { ObjectView } from './primitives';

export type ITestProps = {
  style?: GlamorValue;
};

export type ITestState = {
  editorState?: t.EditorState;
  transactions: t.Transaction[];
  content?: string;
};

export class Test extends React.PureComponent<ITestProps, ITestState> {
  public state: ITestState = { transactions: [] };
  private events$ = new Subject<t.EditorEvent>();

  constructor(props: ITestProps) {
    super(props);
  }

  public componentDidMount() {
    this.events$
      // Display editor events in state.
      .pipe(filter(e => e.payload.stage === 'AFTER'))
      .subscribe(e => {
        const { state, transaction, content } = e.payload;
        this.setState({
          editorState: state,
          content,
          transactions: [...this.state.transactions, transaction],
        });
      });
  }

  public render() {
    const styles = {
      base: css({
        Absolute: 0,
        boxSizing: 'border-box',
        display: 'flex',
      }),
      columns: css({
        margin: 20,
        Flex: 'horizontal-stretch-stretch',
        flex: 1,
      }),
      left: css({
        flex: 1,
        border: `solid 1px ${color.format(-0.1)}`,
        display: 'flex',
      }),
      editor: css({ flex: 1, padding: 10 }),
      right: css({
        marginLeft: 15,
        width: 450,
        Flex: 'vertical',
      }),
      state: css({
        flex: 1,
        Scroll: true,
      }),
      content: css({
        flex: 1,
        maxHeight: '33%',
        Scroll: true,
        borderTop: `solid 1px ${color.format(-0.1)}`,
        paddingTop: 5,
      }),
      log: css({
        flex: 1,
        maxHeight: '33%',
        Scroll: true,
        borderTop: `solid 1px ${color.format(-0.1)}`,
        paddingTop: 5,
      }),
    };

    const { editorState, content } = this.state;
    const doc = editorState ? editorState.doc : undefined;
    const data = { editorState, doc };

    return (
      <div {...styles.base}>
        <div {...styles.columns}>
          <div {...styles.left}>
            <Editor style={styles.editor} events$={this.events$} />
          </div>
          <div {...styles.right}>
            <ObjectView name={'state'} data={data} style={styles.state} />
            <div {...styles.content}>{this.renderContent()}</div>
            <div {...styles.log}>{this.renderLog()}</div>
          </div>
        </div>
      </div>
    );
  }

  private renderLog = () => {
    const { transactions = [] } = this.state;
    const elList = transactions.map((t, i) => {
      return <ObjectView key={i} name={'transaction'} data={t} expandLevel={0} />;
    });
    return <div>{elList}</div>;
  };

  private renderContent = () => {
    const { content } = this.state;
    if (!content) {
      return null;
    }

    const styles = {
      base: css({
        fontWeight: 'bold',
        fontSize: 12,
      }),
      pre: css({
        fontWeight: 'bold',
        fontSize: 12,
        color: COLORS.PURPLE,
      }),
    };
    return (
      <div {...styles.base}>
        <div>content</div>
        <pre {...styles.pre}>{content}</pre>
      </div>
    );
  };
}
