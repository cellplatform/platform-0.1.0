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

export type IModuleViewTreeState = { current?: t.IDisposable };

export class ModuleViewTree extends React.PureComponent<
  IModuleViewTreeProps,
  IModuleViewTreeState
> {
  public state: IModuleViewTreeState = {};
  private state$ = new Subject<Partial<IModuleViewTreeState>>();

  private unmounted$ = new Subject();
  private treeview$ = new Subject<t.TreeviewEvent>();

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
    this.initialize();
  }

  public componentDidUpdate(prev: IModuleViewTreeProps) {
    if (prev.module?.id !== this.props.module?.id) {
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

    const module = this.props.module;
    if (module) {
      const current = dispose.create(this.unmounted$);
      const events = TreeView.events(this.treeview$, current.dispose$);
      events.beforeRender.node$.subscribe(this.beforeNodeRender);

      // Redraw on change.
      module.event.changed$
        .pipe(takeUntil(this.unmounted$), debounceTime(10))
        .subscribe((e) => this.forceUpdate());

      // Start the behavior strategy.
      TreeviewStrategy.default({ root: module }).listen(this.treeview$, current.dispose$);

      // Re-render the component.
      this.state$.next({ current });
    }
  }

  /**
   * Process selection styles on node before it is rendered.
   */
  private beforeNodeRender = (e: t.ITreeviewBeforeRenderNode) => {
    const isSelected = e.node.id === this.selected;
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

  private get root() {
    return this.props.module?.root;
  }

  private get nav() {
    return this.root?.props?.treeview?.nav || {};
  }

  private get current() {
    return this.nav.current;
  }

  private get selected() {
    return this.nav.selected;
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
        current={this.current}
        event$={this.treeview$}
      />
    );
  }
}
