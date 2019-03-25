import '../../node_modules/@platform/css/reset.css';
import '@babel/polyfill';

import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { GraphqlEditor, GraphqlEditorEvent } from '../../src';
import { css, GlamorValue } from './common';

/**
 * Test Component
 */

export type ITestProps = { style?: GlamorValue };
export type ITestState = {};

export class Test extends React.PureComponent<ITestProps, ITestState> {
  public state: ITestState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ITestState>>();
  private events$ = new Subject<GraphqlEditorEvent>();

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
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Absolute: 20,
        display: 'flex',
      }),
    };
    return (
      <div {...styles.base}>
        <GraphqlEditor events$={this.events$} />
      </div>
    );
  }
}
