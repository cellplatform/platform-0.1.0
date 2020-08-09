import { TreeView } from '@platform/ui.tree/lib/components/TreeView';
import * as React from 'react';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue, Module, t } from '../../common';

export type IModuleViewTreeProps = {
  nav: t.ITreeViewNavigation;
  slideDuration?: number;
  style?: CssValue;
  tag?: string; // NB: Used for debugging. A tag to identify the instance.
};

export type IModuleViewTreeState = { nav?: t.ITreeViewNavigation };

export class ModuleViewTree extends React.PureComponent<
  IModuleViewTreeProps,
  IModuleViewTreeState
> {
  /**
   * Construct a navigation controller.
   */
  public static navigation(args: {
    module: t.IModule;
    root?: t.IModule;
    treeview$?: Subject<t.TreeviewEvent>;
    dispose$: Observable<any>;
    strategy?: t.TreeViewNavigationStrategy;
    fire: t.FireEvent<t.ModuleEvent>;
  }) {
    const { dispose$ } = args;
    const root = args.root?.root || args.module.root;
    const fire = Module.fire(args.fire);
    const treeview$ = args.treeview$ || new Subject<t.TreeviewEvent>();

    // Construct the navigation controller.
    const nav = TreeView.Navigation.create({
      tree: args.module,
      treeview$,
      dispose$,
      strategy: args.strategy || TreeView.Navigation.strategies.default,
    });

    // Bubble selection events.
    nav.selection$.pipe(takeUntil(dispose$)).subscribe((e) => {
      const { current, selected } = nav;
      fire.selection({ root, current, selected });
    });

    return nav;
  }

  public state: IModuleViewTreeState = {};
  private state$ = new Subject<Partial<IModuleViewTreeState>>();

  private unmounted$ = new Subject();

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
    this.nav.redraw$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.forceUpdate());
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */

  private get root() {
    return this.nav.root;
  }

  private get current() {
    return this.nav.current;
  }

  private get nav() {
    return this.props.nav;
  }

  public get tag() {
    return this.props.tag;
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
          root={this.root}
          current={this.current}
          event$={nav.treeview$}
          background={'NONE'}
          tabIndex={0}
          slideDuration={this.props.slideDuration}
        />
      </div>
    );
  }
}
