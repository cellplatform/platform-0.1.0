import { TreeView } from '@platform/ui.tree/lib/components/TreeView';
import * as React from 'react';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue, t } from '../../common';
import { Module } from '../../state.Module';

export type IModuleViewTreeProps = {
  event$: Observable<t.Event>;
  filter: t.ModuleFilter;
  tag?: string;
  style?: CssValue;
};

export class ModuleViewTree extends React.PureComponent<IModuleViewTreeProps> {
  private unmounted$ = new Subject();
  private treeview$ = new Subject<t.TreeViewEvent>();

  private tree = TreeView.State.create({ dispose$: this.unmounted$ });

  private nav = TreeView.Navigation.create({
    tree: this.tree,
    treeview$: this.treeview$,
    dispose$: this.unmounted$,
    strategy: TreeView.Navigation.strategies.default,
  });

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.nav.redraw$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.forceUpdate());

    Module.subscribe({
      event$: this.props.event$,
      until$: this.unmounted$,
      tree: this.nav.tree,
      filter: this.props.filter,
    });
  }

  public componentWillUnmount() {
    this.nav.dispose();
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        display: 'flex',
        position: 'relative',
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <TreeView
          root={this.nav.root}
          current={this.nav.current}
          event$={this.treeview$}
          background={'NONE'}
          tabIndex={0}
        />
      </div>
    );
  }
}
