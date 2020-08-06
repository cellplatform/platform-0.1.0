import { TreeView } from '@platform/ui.tree/lib/components/TreeView';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue, t } from '../../common';
import { Module } from '../../state.Module';

export type IModuleViewTreeProps = {
  fire: t.FireEvent<any>;
  tree: t.ITreeState<any>;
  treeview$?: Subject<t.TreeViewEvent>;
  style?: CssValue;
};

export class ModuleViewTree extends React.PureComponent<IModuleViewTreeProps> {
  private unmounted$ = new Subject();
  private treeview$ = this.props.treeview$ || new Subject<t.TreeViewEvent>();

  private nav = TreeView.Navigation.create({
    tree: this.props.tree,
    treeview$: this.treeview$,
    dispose$: this.unmounted$,
    strategy: TreeView.Navigation.strategies.default,
  });

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    this.nav.redraw$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.forceUpdate());

    this.nav.selection$.pipe(takeUntil(this.unmounted$)).subscribe((e) => {
      const { root, current, selected } = this.nav;
      this.fire.selection({ root, current, selected });
    });
  }

  public componentWillUnmount() {
    this.nav.dispose();
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  private get fire() {
    return Module.fire(this.props.fire);
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
