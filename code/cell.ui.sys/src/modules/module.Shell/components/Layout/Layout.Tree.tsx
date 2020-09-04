import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { css, CssValue, t, ui, Module } from '../../common';

export type ILayoutTreeProps = {
  module: t.ShellModule;
  focusOnLoad?: boolean;
  style?: CssValue;
};
export type ILayoutTreeState = { isEmpty?: boolean };

export class LayoutTree extends React.PureComponent<ILayoutTreeProps, ILayoutTreeState> {
  public state: ILayoutTreeState = {};
  private state$ = new Subject<Partial<ILayoutTreeState>>();
  private unmounted$ = new Subject();
  private treeview$ = new Subject<t.TreeviewEvent>();

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
    const tree = ui.ModuleView.Tree.events(this.treeview$, this.unmounted$);
    const events = Module.events(this.module, this.unmounted$);

    // Prevent header from being drawn on root node.
    tree.beforeRender.header$.pipe(filter((e) => e.node.id === this.module.id)).subscribe((e) => {
      e.change((draft) => {
        const header = draft.header || (draft.header = {});
        header.isVisible = false;
      });
    });

    // Insert readable label if there is none
    tree.beforeRender.node$.subscribe((e) => {
      if (!e.node.props?.treeview?.label) {
        e.change((props) => (props.label = Module.Identity.key(e.node.id)));
      }
    });

    // Monitor for empty state.
    events.changed$
      .pipe(filter((e) => isModuleEmpty(this.module) !== this.state.isEmpty))
      .subscribe((e) => this.updateState());

    // Finish up.
    this.updateState();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get module() {
    return this.props.module;
  }

  /**
   * [Methods]
   */
  private updateState() {
    this.state$.next({
      isEmpty: isModuleEmpty(this.module),
    });
  }

  /**
   * [Render]
   */
  public render() {
    return (
      <React.Fragment>
        <ui.ModuleView.Tree
          module={this.module}
          treeview$={this.treeview$}
          style={this.props.style}
          focusOnLoad={this.props.focusOnLoad}
        />
        {this.state.isEmpty && this.renderEmpty()}
      </React.Fragment>
    );
  }

  private renderEmpty() {
    const styles = {
      base: css({
        Absolute: [30, 0, null, 0],
        userSelect: 'none',
      }),
      label: css({
        opacity: 0.3,
        fontSize: 12,
        fontStyle: 'italic',
        textAlign: 'center',
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.label}>No modules to display.</div>
      </div>
    );
  }
}

/**
 * [Helpers]
 */

function isModuleEmpty(module: t.IModule) {
  return (module.root.children || []).length === 0;
}
