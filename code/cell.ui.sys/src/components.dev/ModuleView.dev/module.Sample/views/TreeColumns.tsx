import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, CssValue, t, Module } from '../../common';

export type ITreeColumnsProps = { module: string; style?: CssValue };
export type ITreeColumnsState = t.Object;

export class TreeColumns extends React.PureComponent<ITreeColumnsProps, ITreeColumnsState> {
  public state: ITreeColumnsState = {};
  private state$ = new Subject<Partial<ITreeColumnsState>>();
  private unmounted$ = new Subject();

  public static contextType = Module.Context;
  public context!: t.MyContext;

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
    const styles = { base: css({}) };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div>TreeColumns</div>
      </div>
    );
  }
}
