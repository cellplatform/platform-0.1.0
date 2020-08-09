import { TreeView } from '@platform/ui.tree/lib/components/TreeView';
import * as React from 'react';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil, delay } from 'rxjs/operators';

import { css, CssValue, t, Module } from '../../common';

export type IModuleViewTreeProps = {
  nav?: t.ITreeViewNavigation;
  event$: Observable<t.Event>;
  fire: t.FireEvent<any>;
  treeview$?: Subject<t.TreeviewEvent>;
  node: t.IModule | undefined;
  root?: t.IModule | undefined;
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
  // private treeview$ = new Subject<t.TreeviewEvent>();

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
  }

  public componentDidUpdate(prev: IModuleViewTreeProps) {
    if (this.props.node === undefined && this.state.nav) {
      this.destroyNav();
    }

    const next = this.props;
    if (prev.node?.id !== next.node?.id || prev.nav?.id !== next.nav?.id) {
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
    return this.props.nav || this.state.nav;
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

    if (!this.props.node) {
      return;
    }

    // return; // TEMP 🐷

    console.log('create nav', this.props.tag, Boolean(this.props.nav));

    const nav = TreeView.Navigation.create({
      tree: this.props.node,
      treeview$: this.treeview$,
      dispose$: this.unmounted$,
      strategy: TreeView.Navigation.strategies.default,
    });

    const getRoot = () => this.props.root?.root || nav.root;
    const moduleEvents = Module.events(this.props.event$, nav.dispose$);

    // const isWithinRoot = (module: string) => {
    //   const root = this.props.root ? this.props.root.root : nav.root;
    //   return true;
    // };

    // moduleEvents.selection$
    //   .pipe(
    //     filter((e) => e.root === getRoot().id),
    //     delay(0),
    //   )
    //   .subscribe((e) => {
    //     console.group('🌳 module selection', this.props.tag);
    //     console.log('e.module', e.module);
    //     console.log('nav', nav.root.id);

    //     const contains = nav.query.findById(e.module);
    //     if (contains && e.module !== nav.selected) {
    //       // console.log('SELECT!!!', e.module);
    //       console.log('deselect', nav.selected);
    //       // this.treeview$.next({type:''})
    //       // nav.mutate.selected(undefined);
    //     }

    //     if (contains) {
    //       // nav.select
    //     }

    //     console.log('exists', contains);

    //     console.groupEnd();
    //   });

    nav.redraw$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.forceUpdate());

    nav.selection$.pipe(takeUntil(this.unmounted$)).subscribe((e) => {
      const nav = this.nav;
      if (nav) {
        const { current, selected } = nav;
        // const root = this.props.root ? this.props.root.root : nav.root;
        const root = getRoot();

        this.fire.selection({ root, current, selected });

        console.log('selection', this.tag, nav.selected);
      }
    });

    // nav.u

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
