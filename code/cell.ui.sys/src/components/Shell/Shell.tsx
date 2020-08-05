import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, css, CssValue, ui } from '../../common';
import { TreeView } from '../primitives';
import * as t from './types';

export type IShellProps = {
  module: t.IModule;
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
  // public module!: t.MyModule;

  private nav: t.ITreeViewNavigation;

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));

    this.treeTemp();

    this.forceUpdate();
  }

  private treeTemp() {
    const module = this.module;

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
   * [Properties]
   */
  public get module() {
    return this.props.module as t.IModule<any, t.ModuleEvent>;
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
        flex: 1,
        Flex: 'horizontal-stretch-stretch',
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
        display: 'flex',
        flex: 1,
      }),
    };
    return <div {...styles.base}>{this.fireRender()}</div>;
  }

  /**
   * [Helpers]
   */

  private fireRender = () => {
    const { selected, current } = this.nav;
    const module = this.module;
    const props = module.root.props;
    const data = props?.data || {};
    const view = props?.view || '';

    let res: JSX.Element | null = null;
    const payload: t.IModuleRender = {
      id: module.id,
      tree: { selected, current },
      data,
      view,
      render: (el) => (res = el),
    };

    module.dispatch({ type: 'Module/render', payload });
    return res;
  };
}
