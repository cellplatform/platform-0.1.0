import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { css, CssValue, t, ui, Module, rx } from '../../common';

import { ModuleViewTree } from '@platform/cell.module.view';

type E = t.ShellEvent;

export type IBodyTreeProps = {
  bus: t.EventBus;
  module: t.ShellModule;
  focusOnLoad?: boolean;
  style?: CssValue;
};
export type IBodyTreeState = { isEmpty?: boolean };

export class BodyTree extends React.PureComponent<IBodyTreeProps, IBodyTreeState> {
  public state: IBodyTreeState = {};
  private state$ = new Subject<Partial<IBodyTreeState>>();
  private unmounted$ = new Subject<void>();
  private treeview$ = new Subject<t.TreeviewEvent>();

  private elTree!: ModuleViewTree;
  private elTreeRef = (ref: ModuleViewTree) => (this.elTree = ref);

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
    const bus$ = this.bus.event$.pipe(takeUntil(this.unmounted$));
    const tree = ui.ModuleView.Tree.events(this.treeview$, this.unmounted$);
    const events = Module.events(bus$, this.unmounted$);

    // Prevent header from being drawn on root node.
    tree.beforeRender.header$.pipe(filter((e) => e.node.id === this.module.id)).subscribe((e) => {
      e.change((draft) => {
        const header = draft.header || (draft.header = {});
        header.isVisible = false;
      });
    });

    // Ensure header label is readable if there is none.
    tree.beforeRender.header$.subscribe((e) => {
      if (!e.node.props?.treeview?.label) {
        e.change((draft) => (draft.label = Module.Identity.key(e.node.id)));
      }
    });

    // Insert readable label if there is none.
    tree.beforeRender.node$.subscribe((e) => {
      if (!e.node.props?.treeview?.label) {
        e.change((props) => (props.label = Module.Identity.key(e.node.id)));
      }
    });

    // Monitor for empty state.
    events.changed$
      .pipe(filter((e) => isModuleEmpty(this.module) !== this.state.isEmpty))
      .subscribe((e) => this.updateState());

    // Listen for focus updates.
    rx.payload<t.IShellFocusEvent>(bus$, 'Shell/focus').subscribe((e) => {
      if (this.elTree) {
        this.elTree.focus();
      }
    });

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
  public get bus() {
    return this.props.bus.type<E>();
  }

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
          ref={this.elTreeRef}
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
        <div {...styles.label}>Nothing to display.</div>
      </div>
    );
  }
}

/**
 * [Helpers]
 */

function isModuleEmpty(module: t.IModule) {
  return (module.state.children || []).length === 0;
}
