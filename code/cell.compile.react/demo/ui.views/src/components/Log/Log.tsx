import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue, t } from '../../common';

export type ILogProps = {
  items: t.ILogItem[];
  style?: CssValue;
};
export type ILogState = {};

export class Log extends React.PureComponent<ILogProps, ILogState> {
  public state: ILogState = {};
  private state$ = new Subject<Partial<ILogState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
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
        <div>Log</div>
      </div>
    );
  }
}
