import * as React from 'react';
import { Subject } from 'rxjs';
import { map, filter, takeUntil } from 'rxjs/operators';

import {
  time,
  TextEditor,
  color,
  COLORS,
  css,
  GlamorValue,
  ObjectView,
  t,
  Button,
  Hr,
} from './common';

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nec quam lorem. Praesent fermentum, augue ut porta varius, eros nisl euismod ante, ac suscipit elit libero nec dolor. Morbi magna enim, molestie non arcu id, varius sollicitudin neque. In sed quam mauris. Aenean mi nisl, elementum non arcu quis, ultrices tincidunt augue. Vivamus fermentum iaculis tellus finibus porttitor. Nulla eu purus id dolor auctor suscipit. Integer lacinia sapien at ante tempus volutpat.';

const DEFAULT = {
  /**
   * Default
   */
  MARKDOWN: `
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6
  
- one
- two
- three

1. tahi
2. rua
3. toru

---

Before the \`code\` block:

\`\`\`
code block
\`\`\`

After

> Block quote  \

> For whom the bell tolls.

${LOREM}  

${LOREM}  


  `.substring(1),

  /**
   * Long
   */
  LONG: `
${LOREM}  

---

${LOREM}  

`,

  /**
   * Headerings
   */
  HEADING: `
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

Paragraph - ${LOREM}
  `,
};

const PINK = '#FF004B';
const MY_STYLES: Partial<t.IEditorStyles> = {
  h1: {
    color: PINK,
  },
  hr: {
    borderColor: PINK,
  },
};

export type ITestProps = {
  style?: GlamorValue;
};

export type ITestState = {
  editorState?: t.EditorState;
  transactions?: t.Transaction[];
  size?: t.IEditorSize;
  value?: string;
  fontSize?: number | string;
};

export class Test extends React.PureComponent<ITestProps, ITestState> {
  public state: ITestState = {
    transactions: [],
    value: DEFAULT.MARKDOWN,
    // value: DEFAULT.HEADING,
    // value: '* one\n* two',
    // value: LOREM,
  };
  private unmounted$ = new Subject<{}>();
  private state$ = new Subject<Partial<ITestState>>();
  private events$ = new Subject<t.TextEditorEvent>();

  private editor!: TextEditor;
  private editorRef = (ref: TextEditor) => (this.editor = ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const events$ = this.events$.pipe(takeUntil(this.unmounted$));
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));

    events$.subscribe(e => {
      console.log('🌳', e.type, e.payload);
    });

    events$
      .pipe(
        filter(e => e.type === 'EDITOR/keydown'),
        map(e => e.payload as t.ITextEditorKeydown),
      )
      .subscribe(e => {
        // e.cancel();
      });

    events$
      .pipe(
        filter(e => e.type === 'EDITOR/keydown/enter'),
        map(e => e.payload as t.ITextEditorEnterKey),
        // filter(e => e.isMeta),
      )
      .subscribe(e => {
        // e.cancel();
      });

    events$
      // BEFORE change.
      .pipe(
        filter(e => e.type === 'EDITOR/changing'),
        map(e => e.payload as t.ITextEditorChanging),
      )
      .subscribe(e => {
        const { transaction } = e;
        const transactions = [...(this.state.transactions || []), transaction];
        this.state$.next({ transactions });
        // e.cancel();
      });

    events$
      // AFTER change.
      .pipe(
        filter(e => e.type === 'EDITOR/changed'),
        map(e => e.payload as t.ITextEditorChanged),
      )
      .subscribe(e => {
        const { state } = e;
        this.state$.next({
          editorState: state.to,
          size: e.size.to,
          value: e.value.to,
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
          {this.button('tmp', () => this.state$.next({ value: 'Hello' }))}
          {this.button('focus', () => this.editor.focus())}
          {this.button('focus > blur', () => {
            this.editor.focus();
            time.delay(1200, () => {
              this.editor.focus(false);
            });
          })}
          {this.button('selectAll', () => this.editor.selectAll().focus())}
          {this.button('cursorToStart', () => this.editor.cursorToStart().focus())}
          {this.button('cursorToEnd', () => this.editor.cursorToEnd().focus())}
          <Hr margin={5} />
          {this.button('load: <empty>', () => this.editor.load(''))}
          {this.button('load: short', () => this.editor.load('hello'))}
          {this.button('load: long', () => this.editor.load(DEFAULT.LONG))}
          {this.button('load: markdown', () => this.editor.load(DEFAULT.MARKDOWN))}
          <Hr margin={5} />
          {this.button('(prop) value: <empty>', () => this.state$.next({ value: '' }))}
          {this.button('(prop) value: heading', () => this.state$.next({ value: DEFAULT.HEADING }))}
          {this.button('(prop) value: short', () => this.state$.next({ value: 'hello' }))}
          {this.button('(prop) value: long', () => this.state$.next({ value: DEFAULT.LONG }))}
          <Hr margin={5} />
          {this.button('fontSize: 14', () => this.state$.next({ fontSize: 14 }))}
          {this.button('fontSize: 16 (default)', () => this.state$.next({ fontSize: undefined }))}
          {this.button('fontSize: 22', () => this.state$.next({ fontSize: 22 }))}
        </div>
        <div {...styles.right}>{this.renderEditor()}</div>
      </div>
    );
  }

  private button(title: string, handler?: () => void) {
    return <Button label={title} onClick={handler} block={true} />;
  }

  public renderEditor() {
    const { size } = this.state;
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
        position: 'relative',
        flex: 1,
        border: `dashed 1px ${color.format(-0.15)}`,
      }),
      scrollContainer: css({
        Scroll: true,
        Absolute: 2,
      }),
      size: css({
        Absolute: [-16, null, null, 2],
        fontSize: 10,
        opacity: 0.7,
      }),
      editor: css({
        backgroundColor: 'rgba(255, 0, 0, 0.02)',
      }),
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

    const { editorState } = this.state;
    const doc = editorState ? editorState.doc : undefined;
    const data = { editorState, doc };

    const elSize = size && (
      <div {...styles.size}>
        {size.width} x {size.height}
      </div>
    );

    return (
      <div {...styles.base}>
        <div {...styles.columns}>
          <div {...styles.editorOuter}>
            {elSize}
            <TextEditor
              ref={this.editorRef}
              className={'myClass'}
              value={this.state.value}
              style={styles.scrollContainer}
              editorStyle={styles.editor}
              contentStyle={MY_STYLES}
              cursorToEndOnLoad={true}
              fontSize={this.state.fontSize}
              events$={this.events$}
              focusOnLoad={true}
              allowEnter={true}
              allowMetaEnter={true}
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
    const { value } = this.state;
    if (!value) {
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
        marginLeft: 15,
      }),
    };
    return (
      <div {...styles.base}>
        <div>value (markdown)</div>
        <pre {...styles.pre}>{value}</pre>
      </div>
    );
  };
}
