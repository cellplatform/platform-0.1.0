import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, GlamorValue } from '../../common';

import { Props } from '@platform/cell.ui.props';

export type IDebugPropsProps = { style?: GlamorValue };
export type IDebugPropsState = {};

export class DebugProps extends React.PureComponent<IDebugPropsProps, IDebugPropsState> {
  public state: IDebugPropsState = {};
  private state$ = new Subject<Partial<IDebugPropsState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: IDebugPropsProps) {
    super(props);
  }

  public componentDidMount() {
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
    const styles = { base: css({}) };
    return (
      <div {...css(styles.base, this.props.style)}>
        <Props />
      </div>
    );
  }
}
