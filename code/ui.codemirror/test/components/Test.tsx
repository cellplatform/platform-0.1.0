import '../../node_modules/@platform/css/reset.css';
import '@babel/polyfill';

import { Observable, Subject, BehaviorSubject } from 'rxjs';
import {
  takeUntil,
  take,
  takeWhile,
  map,
  filter,
  share,
  delay,
  distinctUntilChanged,
  debounceTime,
} from 'rxjs/operators';
import * as React from 'react';

import { css, GlamorValue, t, Hr } from './common';
import { FormulaInput } from '../../src';

/**
 * Test Component
 */

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
        Absolute: 20,
        // display: 'flex',
      }),
    };
    return (
      <div {...styles.base}>
        <FormulaInput
          value={this.state.value}
          focusOnLoad={true}
          selectOnLoad={true}
          events$={this.events$}
        />
        <Hr />
        <FormulaInput value={this.state.value} events$={this.events$} maxLength={4} />
        <Hr />
        <FormulaInput value={this.state.value} events$={this.events$} isMultiLine={true} />
      </div>
    );
  }
}
