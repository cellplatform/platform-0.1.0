import { TreeView } from '@platform/ui.tree/lib/components/TreeView';
import * as React from 'react';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue, t } from '../../common';
import { Module } from '../../state.Module';

export type IModuleViewTreeProps = {
  event$: Observable<t.Event>;
  fire: t.FireEvent<any>;
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

    // Sync the local tree with changes coming in from the event bus.
    Module.subscribe({
      event$: this.props.event$,
      until$: this.unmounted$,
      tree: this.nav.tree,
      filter: this.props.filter,
    });

    this.nav.selection$.pipe(takeUntil(this.unmounted$)).subscribe((e) => {
      this.fireRender();
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

  /**
   * [Helpers]
   */

  private findModule(startAt: t.ITreeNode) {
    return this.nav.query.ancestor(startAt, (e) => {
      const props = (e.node.props || {}) as t.ITreeNodePropsModule;
      return props.kind === 'MODULE';
    }) as t.ITreeNode<t.ITreeNodePropsModule> | undefined;
  }

  private fire = (e: t.ModuleEvent) => this.props.fire(e);

  private fireRender = () => {
    const { query, selected, current } = this.nav;

    const selectedNode = selected ? query.findById(selected) : undefined;
    if (!selectedNode) {
      return;
    }

    const moduleNode = this.findModule(selectedNode);
    if (!moduleNode) {
      return;
    }

    /**
     * TODO 🐷
     * - Fire "Module/selection" event
     * - Move render logic onto Module.render() static.
     */

    const id = moduleNode.id;
    const props = moduleNode.props;
    const data = props?.data || {};
    const view = props?.view || '';

    let el: JSX.Element | null | undefined = undefined;
    const payload: t.IModuleRender = {
      id,
      tree: { selected, current, node: selectedNode },
      data,
      view,
      render: (input) => (el = input),
    };

    this.fire({ type: 'Module/render', payload });

    if (el !== undefined) {
      this.fire({ type: 'Module/rendered', payload: { id, el } });
    }
  };
}
