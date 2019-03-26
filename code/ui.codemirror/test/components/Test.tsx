import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { FormulaInput, IFormulaInputProps } from '../../src';
import { color, css, GlamorValue, t } from './common';

export type ITestProps = { style?: GlamorValue };
export type ITestState = {
  value?: string;
};

export class Test extends React.PureComponent<ITestProps, ITestState> {
  public state: ITestState = {
    value: '=IF(A1:B2, TRUE, FALSE) / 100',
  };
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ITestState>>();
  private events$ = new Subject<t.FormulaInputEvent>();

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
        map(e => e.payload as t.FormulaInputTab),
      )
      .subscribe(e => {
        // e.cancel();
        // NB: supressed with `allowTab:false` property on component (below).
      });

    events$
      .pipe(
        filter(e => e.type === 'INPUT/formula/change'),
        map(e => e.payload as t.FormulaInputChange),
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
        Absolute: [0, 20, 20, 20],
      }),
    };
    return (
      <div {...styles.base}>
        {this.renderInput('default - mode: "spreadsheet"', {
          focusOnLoad: true,
          selectOnLoad: true,
        })}
        {this.renderInput('allowTab: true', { allowTab: true })}
        {this.renderInput('maxLength (4)', { maxLength: 4 })}
        {this.renderInput('multiline', { multiline: true, height: 120 })}
      </div>
    );
  }

  private renderInput(title: string, props: IFormulaInputProps) {
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
