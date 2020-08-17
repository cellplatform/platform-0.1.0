import { color, css, CssValue } from '@platform/css';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

import { TreeView } from '../..';
import { t, COLORS } from '../../common';
import { TreeviewStrategy } from '../../TreeviewStrategy';
import { TreeEvents } from '../../TreeEvents';

export type ITestProps = { style?: CssValue };

type Node = t.ITreeviewNode;

const DEFAULT = {
  id: 'root',
  props: { treeview: { label: 'Root' } },
  children: [
    {
      id: 'Default-1',
      children: [{ id: 'Child-2.1' }, { id: 'Child-2.2' }, { id: 'Child-2.3' }],
    },
    { id: 'Default-2' },
    { id: 'Default-3' },
  ],
} as Node;

export class Test extends React.PureComponent<ITestProps> {
  private unmounted$ = new Subject();
  private treeview$ = new Subject<t.TreeviewEvent>();
  private tree = TreeView.State.create({ root: DEFAULT, dispose$: this.unmounted$ });

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    const tree = this.tree;
    const changed$ = tree.event.changed$.pipe(takeUntil(this.unmounted$));
    changed$.pipe(debounceTime(10)).subscribe(() => this.forceUpdate());

    /**
     * State / Behavior Strategy
     */
    const strategy = TreeviewStrategy.default();
    this.treeview$
      .pipe(takeUntil(this.unmounted$))
      .subscribe((event) => strategy.next({ tree, event }));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */

  public get rootNav() {
    return this.tree.root.props?.treeview?.nav || {};
  }

  public get current() {
    return this.rootNav.current;
  }

  public get selected() {
    return this.rootNav.selected;
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Absolute: 0,
        Flex: 'center-center',
      }),
      outer: css({
        width: 550,
        height: '80%',
        Flex: 'horizontal-stretch-stretch',
      }),
      tree: css({
        border: `solid 1px ${color.format(-0.1)}`,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.outer}>
          <TreeView
            root={this.tree.root}
            current={this.current}
            event$={this.treeview$}
            background={'NONE'}
            tabIndex={0}
            focusOnLoad={true}
            style={css(styles.tree, { borderRight: 'none' })}
          />
          <TreeView
            root={this.tree.root}
            current={this.current}
            event$={this.treeview$}
            background={'NONE'}
            tabIndex={0}
            // focusOnLoad={true}
            style={styles.tree}
          />
        </div>
      </div>
    );
  }

  private renderTree(props: { parent?: string }) {
    const styles = {
      base: css({}),
    };
    return (
      <div {...styles.base}>
        <div>Tree</div>
      </div>
    );
  }
}
