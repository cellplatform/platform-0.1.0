import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, GlamorValue } from '../../common';

export type IBodyProps = {};
export type IBodyState = {};

export class Body extends React.PureComponent<IBodyProps, IBodyState> {
  public state: IBodyState = {};
  private state$ = new Subject<Partial<IBodyState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: IBodyProps) {
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
        backgroundColor: color.format(-0.1),
      }),
    };
    return (
      <div {...styles.base}>
        <div>Body</div>
      </div>
    );
  }
}
