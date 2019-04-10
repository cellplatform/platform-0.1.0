import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { FormulaInput, IFormulaInputProps } from '../../src';
import { color, css, GlamorValue, t, Button, Hr } from './common';

export type ITestProps = { style?: GlamorValue };
export type ITestState = {
  value?: string;
};

const DEFAULT = {
  VALUE: '=IF(A1:B2, TRUE, FALSE) / 100',
};

export class Test extends React.PureComponent<ITestProps, ITestState> {
  public state: ITestState = {
    value: DEFAULT.VALUE,
  };
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ITestState>>();
  private events$ = new Subject<t.FormulaInputEvent>();

  private input!: FormulaInput;
  private inputRef = (ref: FormulaInput) => (this.input = ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
    const events$ = this.events$.pipe(takeUntil(this.unmounted$));

    events$.subscribe(e => {
      console.log('🌳 EVENT', e);
    });

    events$
      .pipe(
        filter(e => e.type === 'INPUT/formula/tab'),
        map(e => e.payload as t.IFormulaInputTab),
      )
      .subscribe(e => {
        // e.cancel();
        // NB: supressed with `allowTab:false` property on component (below).
      });

    events$
      .pipe(
        filter(e => e.type === 'INPUT/formula/newLine'),
        map(e => e.payload as t.IFormulaInputNewLine),
      )
      .subscribe(e => {
        // Example: Only allow new-line when SHIFT modifier key is pressed.
        if (!e.modifierKeys.shift) {
          e.cancel();
        }
      });

    events$
      .pipe(
        filter(e => e.type === 'INPUT/formula/changing'),
        map(e => e.payload as t.IFormulaInputChanging),
      )
      .subscribe(e => {
        // Example: selectively cancel a change via the event.
        // e.cancel();
      });

    events$
      .pipe(
        filter(e => e.type === 'INPUT/formula/changed'),
        map(e => e.payload as t.IFormulaInputChanged),
      )
      .subscribe(e => {
        this.state$.next({ value: e.to });
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
        Flex: 'horizontal',
      }),
      left: css({
        width: 180,
        backgroundColor: color.format(-0.04),
        borderRight: `solid 1px ${color.format(-0.1)}`,
        fontSize: 14,
        padding: 10,
        lineHeight: 1.6,
      }),
      right: css({
        flex: 1,
      }),
    };

    return (
      <div {...styles.base}>
        <div {...styles.left}>
          {this.button('value: <empty>', () => this.state$.next({ value: '' }))}
          {this.button('value: DEFAULT', () => this.state$.next({ value: DEFAULT.VALUE }))}
          <Hr />
          {this.button('focus', () => this.input.focus())}
          {this.button('selectAll', () => this.input.selectAll().focus())}
          {this.button('cursorToStart', () => this.input.cursorToStart().focus())}
          {this.button('cursorToEnd', () => this.input.cursorToEnd().focus())}
        </div>
        <div {...styles.right}>{this.renderInputs()}</div>
      </div>
    );
  }

  private button(title: string, handler?: () => void) {
    return <Button label={title} onClick={handler} block={true} />;
  }

  private renderInputs() {
    const styles = {
      base: css({ PaddingX: 20 }),
    };
    return (
      <div {...styles.base}>
        {this.renderInput(
          'default - mode: "spreadsheet"',
          {
            focusOnLoad: true,
            selectOnLoad: true,
          },
          this.inputRef,
        )}
        {this.renderInput('allowTab: true', { allowTab: true })}
        {this.renderInput('maxLength (4)', { maxLength: 4 })}
        {this.renderInput('fontSize (16)', { fontSize: 16 })}
        {this.renderInput('fontSize (8)', { fontSize: 8 })}
        {this.renderInput('multiline', { multiline: true, height: 120 })}
      </div>
    );
  }

  private renderInput(
    title: string,
    props: IFormulaInputProps,
    ref?: React.LegacyRef<FormulaInput>,
  ) {
    const styles = {
      base: css({
        PaddingY: 20,
        borderBottom: `solid 1px ${color.format(-0.1)}`,
      }),
      title: css({
        fontSize: 12,
        opacity: 0.5,
      }),
      body: css({
        marginLeft: 20,
        marginTop: 8,
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.title}>{title}</div>
        <div {...styles.body}>
          <FormulaInput
            ref={ref}
            value={this.state.value}
            allowTab={false}
            {...props}
            events$={this.events$}
          />
        </div>
      </div>
    );
  }
}
