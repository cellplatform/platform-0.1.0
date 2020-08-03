import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { color, css, CssValue, ui } from '../../common';
import { TreeView } from '../primitives';
import { TestPanel } from './TestPanel';
import * as t from './types';
import { renderer } from './render';

import { Module } from '../../Module';

export type IShellProps = {
  style?: CssValue;
};

export type IShellState = {
  selected?: t.IModule<any>;
};

export class Shell extends React.PureComponent<IShellProps, IShellState> {
  public state: IShellState = {};
  private state$ = new Subject<Partial<IShellState>>();
  private unmounted$ = new Subject();
  private treeview$ = new Subject<t.TreeViewEvent>();

  public static contextType = ui.Context;
  public context!: t.IAppContext;
  public module!: t.MyModule;

  private nav: t.ITreeViewNavigation;

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));

    this.module = Module.create<t.MyModuleData, t.MyFooEvent>();

    this.module.event.dispatch$.subscribe((e) => {
      console.log('dispatch', e);
    });

    // Turn off the header on the root node.
    // events.render.header$.pipe(filter((e) => e.depth === 0)).subscribe((e) => {
    //   e.render(null);
    // });

    this.treeTemp();

    this.forceUpdate();
  }

  private treeTemp() {
    const module = this.module;

    const actions = module.action(this.unmounted$);

    actions.dispatched<t.IModuleRegisterEvent>('MODULE/register').subscribe((e) => {
      const child = module.add({ root: e.name }); // TEMP 🐷
      const actions = child.action(this.unmounted$);

      actions.dispatch$.subscribe((e) => {
        console.log('sub-module.dispatch: ', e);
      });

      // When disposed deselect from tree.
      child.dispose$.pipe(filter((e) => child.id === this.nav.selected)).subscribe((e) => {
        this.nav.select(undefined);
      });
    });

    /**
     * Controller
     */

    /**
     * Navigation controller.
     */
    this.nav = TreeView.Navigation.create({
      tree: module,
      treeview$: this.treeview$,
      dispose$: this.unmounted$,
      strategy: TreeView.Navigation.strategies.default,
    });
    this.nav.redraw$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.forceUpdate());

    /**
     * Selection changed.
     */
    this.nav.selection$.subscribe((e) => {
      const namespace = TreeView.identity.namespace(e.selected);
      const selected = module.find((args) => args.namespace === namespace);
      this.state$.next({ selected });
    });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
    if (!this.nav) {
      return null;
    }

    const styles = {
      base: css({
        Absolute: 0,
        Flex: 'horizontal-stretch-stretch',
        backgroundColor: color.format(1),
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        {this.renderTree()}
        {this.renderBody()}
      </div>
    );
  }

  private renderTree() {
    const styles = {
      base: css({
        display: 'flex',
        width: 280,
        borderRight: `solid 1px ${color.format(-0.1)}`,
        WebkitAppRegion: 'drag',
      }),
    };
    return (
      <div {...styles.base}>
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

  private renderBody() {
    const styles = {
      base: css({
        position: 'relative',
        boxSizing: 'border-box',
        padding: 30,
        display: 'flex',
        flex: 1,
      }),
    };
    return (
      <div {...styles.base}>
        <TestPanel root={this.module} selected={this.state.selected} factory={renderer} />
      </div>
    );
  }
}
