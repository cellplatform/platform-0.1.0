import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { color, css, CssValue, t } from '../../common';
import { TreeView } from '../primitives';

export type IDebugShellProps = {
  tree?: t.ITreeState;
  style?: CssValue;
};
export type IDebugShellState = t.Object;

export class DebugShell extends React.PureComponent<IDebugShellProps, IDebugShellState> {
  public state: IDebugShellState = {};
  private state$ = new Subject<Partial<IDebugShellState>>();
  private unmounted$ = new Subject();
  private treeview$ = new Subject<t.TreeViewEvent>();

  private nav = TreeView.Navigation.create({
    tree: this.props.tree,
    treeview$: this.treeview$,
    dispose$: this.unmounted$,
    strategy: TreeView.Navigation.strategies.default,
  });

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    const unmounted$ = this.unmounted$;
    this.state$.pipe(takeUntil(unmounted$)).subscribe((e) => this.setState(e));
    this.nav.redraw$.pipe(takeUntil(unmounted$)).subscribe((e) => this.forceUpdate());
    const events = TreeView.events(this.treeview$, unmounted$);

    // Turn off the header on the root node.
    events.render.header$.pipe(filter((e) => e.depth === 0)).subscribe((e) => {
      e.render(null);
    });

    // TEMP 🐷
    // this.nav.
    const cache = this.nav.tree.add({ root: 'cache' });

    // cache.store.tre
    cache.change((draft, ctx) => {
      ctx.children(draft, (children) => {
        children.push(...[{ id: 'foo' }, { id: 'bar' }]);
      });
    });

    // this.nav.tree.
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
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
        boxSizing: 'border-box',
        padding: 30,
      }),
    };
    return (
      <div {...styles.base}>
        <div>Body</div>
      </div>
    );
  }
}
