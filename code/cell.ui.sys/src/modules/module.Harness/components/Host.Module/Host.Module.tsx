import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, CssValue, t, color, ui } from '../../common';

export type IHostModuleProps = {
  bus: t.EventBus;
  harness: t.HarnessModule;
  style?: CssValue;
};
export type IHostModuleState = t.Object;

export class HostModule extends React.PureComponent<IHostModuleProps, IHostModuleState> {
  public state: IHostModuleState = {};
  private state$ = new Subject<Partial<IHostModuleState>>();
  private unmounted$ = new Subject();

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
        position: 'relative',
        flex: 1,
      }),
      frame: css({
        border: `solid 1px ${color.format(1)}`,
        Absolute: 40,
        backgroundColor: color.format(1),
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <ui.ModuleView.Frame bus={this.props.bus} filter={this.viewFilter} style={styles.frame} />
      </div>
    );
  }

  /**
   * Handlers
   */

  private viewFilter: t.ModuleFilterView = (e) => {
    // NB: For the root view into a module it is assumed there is not narrower render "target".
    return !e.target;
  };
}
