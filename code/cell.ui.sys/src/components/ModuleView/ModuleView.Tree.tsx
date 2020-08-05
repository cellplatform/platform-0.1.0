import * as React from 'react';
import { Subject, Observable } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { css, CssValue, t } from '../../common';
import { TreeView } from '@platform/ui.tree/lib/components/TreeView';
import { Module } from '../../state.Module';

export type IModuleViewTreeProps = {
  event$: Observable<t.Event>;
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
    const events = Module.events(this.props.event$, this.unmounted$).filter(this.props.filter);

    // Keep the local tree in-sync with module changes.
    events.changed$.subscribe((e) => {
      const to = e.change.to;

      this.tree.change((draft, ctx) => {
        draft.props = to.props;
        draft.children = to.children;

        // if (this.props.map) {
        //   const r = this.props.map(draft);
        //   console.log('r', r);
        // }
      });
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
}
