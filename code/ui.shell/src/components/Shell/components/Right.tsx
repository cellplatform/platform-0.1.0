import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, GlamorValue } from '../../common';

export type IRightProps = {};
export type IRightState = {};

export class Right extends React.PureComponent<IRightProps, IRightState> {
  public state: IRightState = {};
  private state$ = new Subject<Partial<IRightState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: IRightProps) {
    super(props);
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
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
        padding: 8,
      }),
    };
    return (
      <div {...styles.base}>
        <div>Right</div>
      </div>
    );
  }
}
