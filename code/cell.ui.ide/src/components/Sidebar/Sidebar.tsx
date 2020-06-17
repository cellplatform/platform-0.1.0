import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, CssValue } from '../../common';

export type ISidebarProps = { style?: CssValue };
export type ISidebarState = {};

export class Sidebar extends React.PureComponent<ISidebarProps, ISidebarState> {
  public state: ISidebarState = {};
  private state$ = new Subject<Partial<ISidebarState>>();
  private unmounted$ = new Subject<{}>();

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
    const styles = {
      base: css({
        Absolute: 0,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div>Sidebar</div>
      </div>
    );
  }
}
