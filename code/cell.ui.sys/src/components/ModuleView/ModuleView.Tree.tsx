import { TreeView } from '@platform/ui.tree/lib/components/TreeView';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue, t, Module } from '../../common';

export type IModuleViewTreeProps = {
  fire: t.FireEvent<any>;
  tree: t.ITreeState<any> | undefined;
  treeview$?: Subject<t.TreeviewEvent>;
  style?: CssValue;
  tag?: string; // NB: Used for debugging. A tag to identify the instance.
};

export type IModuleViewTreeState = { nav?: t.ITreeViewNavigation };

export class ModuleViewTree extends React.PureComponent<
  IModuleViewTreeProps,
  IModuleViewTreeState
> {
  public static Navigation = TreeView.Navigation;

  public state: IModuleViewTreeState = {};
  private state$ = new Subject<Partial<IModuleViewTreeState>>();

  private unmounted$ = new Subject();
  private treeview$ = this.props.treeview$ || new Subject<t.TreeviewEvent>();

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
  }

  public componentDidUpdate(prevProps: IModuleViewTreeProps) {
    if (this.props.tree === undefined && this.state.nav) {
      this.destroyNav();
    }

    const prev = prevProps.tree?.id;
    const next = this.props.tree?.id;
    if (prev !== next) {
      this.createNav();
    }
  }

  public componentWillUnmount() {
    this.nav?.dispose();
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  private get fire() {
    return Module.fire(this.props.fire);
  }

  private get nav() {
    return this.state.nav;
  }

  private get tag() {
    return this.props.tag;
  }

  /**
   * [Methods]
   */
  private destroyNav() {
    if (this.nav) {
      this.nav.dispose();
      this.state$.next({ nav: undefined });
    }
  }

  private createNav() {
    this.destroyNav();

    if (!this.props.tree) {
      return;
    }

    const nav = TreeView.Navigation.create({
      tree: this.props.tree,
      treeview$: this.treeview$,
      dispose$: this.unmounted$,
      strategy: TreeView.Navigation.strategies.default,
    });

    nav.redraw$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.forceUpdate());

    nav.selection$.pipe(takeUntil(this.unmounted$)).subscribe((e) => {
      const nav = this.nav;
      if (nav) {
        const { root, current, selected } = nav;
        this.fire.selection({ root, current, selected });
      }
    });

    this.state$.next({ nav });
  }

  /**
   * [Render]
   */
  public render() {
    const nav = this.nav;
    if (!nav) {
      return null;
    }

    const styles = {
      base: css({
        display: 'flex',
        position: 'relative',
      }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        <TreeView
          root={nav.root}
          current={nav.current}
          event$={this.treeview$}
          background={'NONE'}
          tabIndex={0}
        />
      </div>
    );
  }
}
