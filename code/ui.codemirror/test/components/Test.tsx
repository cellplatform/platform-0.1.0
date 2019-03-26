import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { FormulaInput, IFormulaInputProps } from '../../src';
import { css, GlamorValue, Hr, t, color } from './common';

export type ITestProps = { style?: GlamorValue };
export type ITestState = {
  value?: string;
};

export class Test extends React.PureComponent<ITestProps, ITestState> {
  public state: ITestState = { value: '=SUM(1, 2, 3)' };
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
        e.cancel();
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
        {this.renderInput('default', { focusOnLoad: true, selectOnLoad: true })}
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
          <FormulaInput value={this.state.value} {...props} events$={this.events$} />
        </div>
      </div>
    );
  }
}
