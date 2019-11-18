import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';

import { value, color, constants, containsFocus, css, GlamorValue, t, R, time } from '../../common';

import * as p from '../primitives';
import { THEMES } from './themes';

const BORDER = { WIDTH: 2 };
const { DEFAULT, COLORS, ROBOTO, CSS } = constants;

type ICommonMethods = {
  focus(): any;
  selectAll(): any;
  cursorToStart(): any;
  cursorToEnd(): any;
};

export type ICellEditorViewProps = {
  events$?: Subject<t.CellEditorEvent>;
  value?: string;
  row?: number;
  column?: number;
  title?: React.ReactNode;
  mode?: t.CellEditorMode;
  width?: number;
  height?: number;
  theme?: t.ICellEditorTheme | 'DEFAULT';
  style?: GlamorValue;
};

export class CellEditorView extends React.PureComponent<ICellEditorViewProps> {
  /**
   * [Static]
   */
  public static THEMES = THEMES;
  public static BORDER = BORDER;

  /**
   * [Fields]
   */
  private unmounted$ = new Subject<{}>();

  private formula$ = new Subject<p.FormulaInputEvent>();
  private formula!: p.FormulaInput;
  private formulaRef = (ref: p.FormulaInput) => (this.formula = ref);

  private markdown$ = new Subject<p.TextEditorEvent>();
  private markdown!: p.TextEditor;
  private markdownRef = (ref: p.TextEditor) => (this.markdown = ref);

  private text$ = new Subject<p.TextInputEvent>();
  private text!: p.TextInput;
  private textRef = (ref: p.TextInput) => (this.text = ref);

  private _events$ = new Subject<t.CellEditorEvent>();
  public events$ = this._events$.pipe(takeUntil(this.unmounted$), share());

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    if (this.props.events$) {
      this.events$.subscribe(this.props.events$);
    }

    const formula$ = this.formula$.pipe(takeUntil(this.unmounted$));
    const markdown$ = this.markdown$.pipe(takeUntil(this.unmounted$));
    const text$ = this.text$.pipe(takeUntil(this.unmounted$));

    text$.subscribe(e => {
      // console.log('🐶 TEXT', e);
    });

    formula$.subscribe(e => {
      // console.log('🌳 FORMULA', e);
    });

    markdown$.subscribe(e => {
      // console.log('🌼 MARKDOWN', e);
    });

    /**
     * Formula.
     */
    formula$
      .pipe(
        filter(e => e.type === 'INPUT/formula/changing'),
        filter(e => this.mode === 'FORMULA'),
        map(e => e.payload as p.IFormulaInputChanging),
      )
      .subscribe(e => {
        const { from, to } = e;
        const { isCancelled } = this.fireChanging('FORMULA', from, to);
        if (isCancelled) {
          e.cancel();
        }
      });

    formula$
      .pipe(
        filter(e => e.type === 'INPUT/formula/changed'),
        filter(e => this.mode === 'FORMULA'),
        map(e => e.payload as p.IFormulaInputChanged),
      )
      .subscribe(e => {
        const { from, to } = e;
        const value = { from, to };
        this.fireChanged({ mode: 'FORMULA', value });
      });

    formula$
      .pipe(
        filter(e => e.type === 'INPUT/formula/enter'),
        filter(e => this.mode === 'FORMULA'),
        map(e => e.payload as p.IFormulaInputEnter),
      )
      .subscribe(e => {
        const { modifierKeys } = e;
        const isShift = modifierKeys.shift;
        const isMeta = modifierKeys.meta;
        this.fire({ type: 'CELL_EDITOR/enter', payload: { isMeta, isShift } });
      });

    /**
     * Plain text.
     */
    text$
      .pipe(
        filter(e => e.type === 'TEXT_INPUT/changing'),
        filter(e => this.mode === 'TEXT'),
        map(e => e.payload as p.ITextInputChanging),
      )
      .subscribe(e => {
        const { from, to } = e;
        const { isCancelled } = this.fireChanging('TEXT', from, to);
        if (isCancelled) {
          e.cancel();
        }
      });

    text$
      .pipe(
        filter(e => e.type === 'TEXT_INPUT/changed'),
        filter(e => this.mode === 'TEXT'),
        map(e => e.payload as p.ITextInputChanged),
      )
      .subscribe(e => {
        const { from, to } = e;
        const value = { from, to };
        this.fireChanged({ mode: 'TEXT', value });
      });

    const textKeydown$ = text$.pipe(
      filter(e => e.type === 'TEXT_INPUT/keypress'),
      filter(e => this.mode === 'TEXT'),
      map(e => e.payload as p.ITextInputKeypress),
      filter(e => e.isPressed),
    );

    textKeydown$.pipe(filter(e => e.key === 'Enter')).subscribe(e => {
      const isShift = e.event.shiftKey;
      const isMeta = e.event.metaKey;
      this.fire({ type: 'CELL_EDITOR/enter', payload: { isMeta, isShift } });
    });

    /**
     * Rich text (markdown).
     */
    markdown$
      .pipe(
        filter(e => e.type === 'EDITOR/changing'),
        filter(e => this.mode === 'MARKDOWN'),
        map(e => e.payload as p.ITextEditorChanging),
        filter(e => e.value.to !== e.value.from || !R.equals(e.size.from, e.size.to)),
      )
      .subscribe(e => {
        const { from, to } = e.value;
        const { isCancelled } = this.fireChanging('MARKDOWN', from, to);
        if (isCancelled) {
          e.cancel();
        }
      });

    markdown$
      .pipe(
        filter(e => e.type === 'EDITOR/changed'),
        filter(e => this.mode === 'MARKDOWN'),
        map(e => e.payload as p.ITextEditorChanged),
        filter(e => e.value.to !== e.value.from || !R.equals(e.size.from, e.size.to)),
      )
      .subscribe(e => {
        const { from, to } = e.value;
        const value = { from, to };
        this.fireChanged({ mode: 'MARKDOWN', value });
        this.fireSize(e.size.from);
      });

    markdown$
      .pipe(
        filter(e => e.type === 'EDITOR/keydown/enter'),
        filter(e => this.mode === 'MARKDOWN'),
        map(e => e.payload as p.ITextEditorEnterKey),
        filter(e => !e.isCancelled),
      )
      .subscribe(e => {
        const { isMeta, isShift } = e;
        this.fire({ type: 'CELL_EDITOR/enter', payload: { isMeta, isShift } });
      });

    // Finish up.
    time.delay(0, () => this.fireSize());
  }

  public componentDidUpdate(prev: ICellEditorViewProps) {
    const mode = this.mode;
    if (mode !== prev.mode) {
      if (this.isFocused) {
        this.focus(); // Ensure focus is switched to the INPUT component for the new mode.
      }
    }
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get value() {
    return this.props.value || '';
  }

  public get isFocused() {
    return containsFocus(this);
  }

  public get theme() {
    const { theme = 'DEFAULT' } = this.props;
    if (typeof theme === 'object') {
      return theme;
    }
    switch (theme) {
      case 'DEFAULT':
        return THEMES.DEFAULT;
    }
    throw new Error(`Theme '${theme}' not supported`);
  }

  public get mode() {
    return this.props.mode || 'MARKDOWN';
  }

  public get row() {
    return this.props.row || 0;
  }
  public get column() {
    return this.props.column || 0;
  }

  private get size(): t.ISize {
    const width = value.defaultValue(this.props.width, -1);
    const height = value.defaultValue(this.props.height, -1);
    return { width, height };
  }

  private get currentEditor(): ICommonMethods {
    const mode = this.mode;
    if (mode === 'MARKDOWN' && this.markdown) {
      return this.markdown;
    }
    if (mode === 'FORMULA' && this.formula) {
      return this.formula;
    }
    if (mode === 'TEXT' && this.text) {
      return this.text;
    }
    throw new Error(`Mode '${mode}' not supported.`);
  }

  /**
   * [Methods]
   */
  public focus() {
    this.currentEditor.focus();
    return this;
  }

  public selectAll() {
    this.currentEditor.selectAll();
    return this;
  }

  public cursorToStart() {
    this.currentEditor.cursorToStart();
    return this;
  }

  public cursorToEnd() {
    this.currentEditor.cursorToEnd();
    return this;
  }

  private fire(e: t.CellEditorEvent) {
    this._events$.next(e);
  }

  private fireChanging(mode: t.CellEditorMode, from: string, to: string) {
    const self = this; // tslint:disable-line
    let isCancelled = false;
    const payload = {
      mode,
      value: { from, to },
      cancel() {
        isCancelled = true;
      },
      get isCancelled() {
        return isCancelled;
      },
      get isFocused() {
        return self.isFocused;
      },
    };
    this.fire({
      type: 'CELL_EDITOR/changing',
      payload: payload as t.ICellEditorChanging,
    });
    return payload;
  }

  private fireChanged(payload: t.ICellEditorChanged) {
    this.fire({
      type: 'CELL_EDITOR/changed',
      payload: payload,
    });
    return payload;
  }

  private fireSize(from?: t.ISize) {
    from = from || this.size;
    let to = this.size;

    const mode = this.mode;
    if (mode === 'MARKDOWN') {
      to = this.markdown.size;
      to = { ...to, height: to.height + BORDER.WIDTH * 2 };
    }

    this.fire({
      type: 'CELL_EDITOR/size',
      payload: { mode, from, to },
    });
  }

  /**
   * [Render]
   */
  public render() {
    const { width, height } = this.props;
    const theme = this.theme;
    const shadow = theme.inputShadow;

    const styles = {
      base: css({
        position: 'relative',
        boxSizing: 'border-box',
        boxShadow: `0 0px ${shadow.blur}px 0 ${color.format(shadow.color)}`,
        backgroundColor: color.format(theme.inputBackground),
        width,
        height,
        minHeight: DEFAULT.ROW.HEIGHT + (this.row === 0 ? -1 : 0),
      }),
      body: css({ Absolute: 0 }),
    };
    return (
      <div {...css(styles.base, this.props.style)} className={CSS.CLASS.CELL.EDITOR}>
        {this.renderBorder()}
        <div {...styles.body}>
          {this.renderTitle()}
          {this.renderFormula()}
          {this.renderText()}
          {this.renderMarkdown()}
        </div>
      </div>
    );
  }

  private renderBorder() {
    const BORDER = STYLES.BORDER;
    return (
      <React.Fragment>
        <div {...BORDER.left} />
        <div {...BORDER.top} />
        <div {...BORDER.right} />
        <div {...BORDER.bottom} />
      </React.Fragment>
    );
  }

  private renderTitle() {
    const { title } = this.props;
    if (!title) {
      return null;
    }
    const theme = this.theme;
    const styles = {
      base: css({
        Absolute: [-3, null, null, 0],
        userSelect: 'none',
      }),
      body: css({
        Absolute: [null, null, 0, 0],
        backgroundColor: color.format(theme.titleBackground),
        color: color.format(theme.titleColor),
        fontSize: 12,
        PaddingX: 10,
        paddingTop: 5,
        paddingBottom: 3,
      }),
    };
    return (
      <div {...styles.base}>
        <p.Text style={styles.body}>{title}</p.Text>
      </div>
    );
  }

  private renderFormula() {
    const isVisible = this.mode === 'FORMULA';
    const styles = {
      base: css({
        position: isVisible ? 'relative' : 'absolute',
        left: isVisible ? 0 : -999999,
        top: BORDER.WIDTH + (this.row === 0 ? -1 : 0),
        height: DEFAULT.ROW.HEIGHT - BORDER.WIDTH * 2,
        PaddingX: BORDER.WIDTH,
      }),
    };
    return (
      <div {...styles.base}>
        <p.FormulaInput
          ref={this.formulaRef}
          events$={this.formula$}
          multiline={false}
          value={this.value}
          fontSize={12}
          focusOnLoad={isVisible}
        />
      </div>
    );
  }

  private renderText() {
    const isVisible = this.mode === 'TEXT';
    const styles = {
      base: css({
        position: isVisible ? 'relative' : 'absolute',
        left: isVisible ? 0 : -999999,
        top: this.row === 0 ? 1 : 2,
        height: DEFAULT.ROW.HEIGHT - BORDER.WIDTH * 2,
        PaddingX: BORDER.WIDTH,
      }),
      input: css({
        fontSize: 14,
        paddingTop: 2,
        paddingLeft: 3,
      }),
    };
    return (
      <div {...styles.base}>
        <p.TextInput
          ref={this.textRef}
          events$={this.text$}
          value={this.value}
          style={styles.input}
        />
      </div>
    );
  }

  private renderMarkdown() {
    const isVisible = this.mode === 'MARKDOWN';

    const styles = {
      editor: css({
        position: isVisible ? 'relative' : 'absolute',
        left: isVisible ? undefined : -9999999,
        top: this.row === 0 ? 0 : 1,
        margin: BORDER.WIDTH,
        fontFamily: ROBOTO.FAMILY,
        fontSize: 14,
        PaddingX: 3,
      }),
    };
    return (
      <p.TextEditor
        ref={this.markdownRef}
        style={styles.editor}
        events$={this.markdown$}
        value={this.value}
        allowEnter={false}
        allowHeadings={true}
      />
    );
  }
}

/**
 * [Helpers]
 */
const STYLES = {
  BORDER: {
    left: css({
      backgroundColor: COLORS.BLUE,
      Absolute: [0, null, 0, 0],
      width: BORDER.WIDTH,
    }),
    top: css({
      backgroundColor: COLORS.BLUE,
      Absolute: [0, 0, null, 0],
      height: BORDER.WIDTH,
    }),
    right: css({
      backgroundColor: COLORS.BLUE,
      Absolute: [0, 0, 0, null],
      width: BORDER.WIDTH,
    }),
    bottom: css({
      backgroundColor: COLORS.BLUE,
      Absolute: [null, 0, 0, 0],
      height: BORDER.WIDTH,
    }),
  },
};
