import { ITreeViewProps, TreeView } from '@platform/ui.tree/lib/components/TreeView';
import { TreeviewStrategy } from '@platform/ui.tree/lib/TreeviewStrategy';
import * as React from 'react';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { color, COLORS, CssValue, dispose, t } from '../../common';

export type IModuleViewTreeProps = {
  module?: t.IModule;
  treeview?: ITreeViewProps;
  style?: CssValue;
};

export type IModuleViewTreeState = {
  current?: t.IDisposable;
};

export class ModuleViewTree extends React.PureComponent<
  IModuleViewTreeProps,
  IModuleViewTreeState
> {
  public static Strategy = TreeviewStrategy;

  public state: IModuleViewTreeState = {};
  private state$ = new Subject<Partial<IModuleViewTreeState>>();
  private treeview$ = new Subject<t.TreeviewEvent>();
  private unmounted$ = new Subject();

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
    this.initialize();
  }

  public componentDidUpdate(prev: IModuleViewTreeProps) {
    const next = this.props;
    if (prev.module?.id !== next.module?.id) {
      this.initialize();
    }
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  private initialize() {
    this.state.current?.dispose();
    this.state$.next({ current: undefined });

    const tree = this.props.module;
    if (tree) {
      const disposable = dispose.create(this.unmounted$);
      const until$ = disposable.dispose$;

      // Start the behavior strategy.
      const treeview$ = this.treeview$;
      const strategy = TreeviewStrategy.default({ tree, treeview$, until$ });

      // Wire up tree-view events.
      const events = TreeView.events(this.treeview$, until$);
      events.beforeRender.node$.subscribe(this.beforeNodeRender);

      // Redraw on change.
      tree.event.changed$
        .pipe(takeUntil(this.unmounted$), debounceTime(10))
        .subscribe((e) => this.forceUpdate());

      // Re-render the component.
      this.state$.next({ current: { ...disposable } });
    }
  }

  /**
   * Process selection styles on node before it is rendered.
   */
  private beforeNodeRender = (e: t.ITreeviewBeforeRenderNode) => {
    const isSelected = e.node.id === this.nav.selected;
    if (isSelected) {
      e.change((props) => {
        const colors = props.colors || (props.colors = {});
        colors.label = e.isFocused ? COLORS.BLUE : undefined;
        colors.bg = e.isFocused ? color.format(-0.06) : color.format(-0.03);
      });
    }
  };

  /**
   * [Properties]
   */

  // private get strategy() {
  //   return this.state.current?.strategy;
  // }

  private get root() {
    return this.props.module?.root;
  }

  private get nav() {
    return this.root?.props?.treeview?.nav || {};
  }

  /**
   * [Render]
   */

  public render() {
    return (
      <TreeView
        background={'NONE'}
        tabIndex={0}
        {...this.props.treeview}
        style={this.props.style}
        root={this.root}
        current={this.nav.current}
        event$={this.treeview$}
      />
    );
  }
}
