import * as React from 'react';
import { Subject } from 'rxjs';
import { map, filter, takeUntil } from 'rxjs/operators';

import { TextEditor, color, COLORS, css, GlamorValue, ObjectView, t, Button, Hr } from './common';

export type ITestProps = {
  style?: GlamorValue;
};

export type ITestState = {
  editorState?: t.EditorState;
  transactions?: t.Transaction[];
  content?: string;
};

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nec quam lorem. Praesent fermentum, augue ut porta varius, eros nisl euismod ante, ac suscipit elit libero nec dolor. Morbi magna enim, molestie non arcu id, varius sollicitudin neque. In sed quam mauris. Aenean mi nisl, elementum non arcu quis, ultrices tincidunt augue. Vivamus fermentum iaculis tellus finibus porttitor. Nulla eu purus id dolor auctor suscipit. Integer lacinia sapien at ante tempus volutpat.';

const DEFAULT = {
  MARKDOWN: `
# Heading1
## Heading2
### Heading3
#### Heading4
##### Heading5

- one
- two
- three

---

Before

      code block

After

  `.substring(1),
  LONG: `
${LOREM}  

---

${LOREM}  
  `,
};

export class Test extends React.PureComponent<ITestProps, ITestState> {
  public state: ITestState = { transactions: [] };
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ITestState>>();
  private events$ = new Subject<t.TextEditorEvent>();

  private editor!: TextEditor;
  private editorRef = (ref: TextEditor) => (this.editor = ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public componentDidMount() {
    const events$ = this.events$.pipe(takeUntil(this.unmounted$));

    events$.subscribe(e => {
      console.log('🌳', e);
    });

    events$
      // Cancel change.
      .pipe(
        filter(e => e.type === 'EDITOR/changing'),
        map(e => e.payload as t.ITextEditorChanging),
      )
      .subscribe(e => {
        // e.cancel();
      });

    events$
      // Display editor events in state.
      .pipe(
        filter(e => e.type === 'EDITOR/changed'),
        map(e => e.payload as t.ITextEditorChanged),
      )
      .subscribe(e => {
        const { state, transaction, content } = e;
        this.state$.next({
          editorState: state,
          content,
          transactions: [...(this.state.transactions || []), transaction],
        });
      });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
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
        position: 'relative',
        flex: 1,
      }),
    };

    return (
      <div {...styles.base}>
        <div {...styles.left}>
          {this.button('focus', () => this.editor.focus())}
          <Hr margin={5} />
          {this.button('load: <empty>', () => this.editor.load(''))}
          {this.button('load: short', () => this.editor.load('hello'))}
          {this.button('load: long', () => this.editor.load(DEFAULT.LONG))}
          {this.button('load: markdown', () => this.editor.load(DEFAULT.MARKDOWN))}
        </div>
        <div {...styles.right}>{this.renderEditor()}</div>
      </div>
    );
  }

  private button(title: string, handler?: () => void) {
    return <Button label={title} onClick={handler} block={true} />;
  }

  public renderEditor() {
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
      editorOuter: css({
        flex: 1,
        border: `dashed 1px ${color.format(-0.15)}`,
        display: 'flex',
        padding: 2,
      }),
      editor: css({ flex: 1 }),
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
          <div {...styles.editorOuter}>
            <TextEditor
              ref={this.editorRef}
              style={styles.editor}
              events$={this.events$}
              focusOnLoad={true}
            />
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
