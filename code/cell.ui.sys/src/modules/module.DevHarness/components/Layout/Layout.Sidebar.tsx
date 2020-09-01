import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, CssValue, t, Module, ui } from '../../common';

import { PropList } from '@platform/cell.ui/lib/components/PropList';

export type ISidebarProps = {
  bus: t.EventBus;
  harness: t.HarnessModule;
  style?: CssValue;
};
export type ISidebarState = t.Object;

export class Sidebar extends React.PureComponent<ISidebarProps, ISidebarState> {
  public state: ISidebarState = {};
  private state$ = new Subject<Partial<ISidebarState>>();
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
   * [Properties]
   */
  public get harness() {
    return this.props.harness;
  }

  /**
   * [Render]
   */
  public render() {
    const SIDEBAR: t.HarnessTarget = 'Sidebar';

    const styles = {
      base: css({
        position: 'relative',
        flex: 1,
        PaddingX: 20,
        PaddingY: 20,
        fontSize: 14,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        {/* {this.renderTmp()} */}
        <ui.ModuleView.Frame bus={this.props.bus} filter={this.viewFilter} target={SIDEBAR} />
      </div>
    );
  }

  private renderTmp() {
    const styles = {
      base: css({}),
    };

    const items = { foo: 123, bar: 456 };

    return (
      <div {...styles.base}>
        <PropList items={items} />
      </div>
    );
  }

  /**
   * Handlers
   */
  private viewFilter: t.ModuleFilterView<t.HarnessView, t.HarnessTarget> = (e) => {
    const harness = this.harness.id;

    if (e.view === 'Null') {
      // NB: This is the DevHarness clearing the sidebar.
      return e.module === harness;
    } else {
      // NB: Ignore the DevHarness module itself.
      //     We are looking for "dev" components hosted within the harness.
      return e.module !== harness;
    }
  };
}
