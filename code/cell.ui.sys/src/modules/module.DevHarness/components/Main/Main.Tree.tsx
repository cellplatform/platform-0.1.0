import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { css, CssValue, t, ui, Module } from '../../common';

export type ITreeProps = {
  harness: t.HarnessModule;
  focusOnLoad?: boolean;
  style?: CssValue;
};
export type ITreeState = { isEmpty?: boolean };

export class Tree extends React.PureComponent<ITreeProps, ITreeState> {
  public state: ITreeState = {};
  private state$ = new Subject<Partial<ITreeState>>();
  private unmounted$ = new Subject();
  private treeview$ = new Subject<t.TreeviewEvent>();

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
    const tree = ui.ModuleView.Tree.events(this.treeview$, this.unmounted$);
    const events = Module.events(this.harness, this.unmounted$);

    // Prevent header from being drawn on root harness node.
    tree.beforeRender.header$.pipe(filter((e) => e.node.id === this.harness.id)).subscribe((e) => {
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
      .pipe(filter((e) => isModuleEmpty(this.harness) !== this.state.isEmpty))
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
  public get harness() {
    return this.props.harness;
  }

  /**
   * [Methods]
   */
  private updateState() {
    this.state$.next({
      isEmpty: isModuleEmpty(this.harness),
    });
  }

  /**
   * [Render]
   */
  public render() {
    return (
      <React.Fragment>
        <ui.ModuleView.Tree
          module={this.harness}
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
