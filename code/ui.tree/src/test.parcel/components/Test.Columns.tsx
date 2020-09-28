import { color, css, CssValue } from '@platform/css';
import * as React from 'react';
import { Subject, merge } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Button } from '@platform/ui.button';

import { Tree } from '../..';
import { t } from '../../common';

type Node = t.ITreeviewNode;

const DEFAULT: Node = {
  id: 'root',
  props: { treeview: { label: 'Root' } },
  children: [
    {
      id: 'Root-1',
      children: [
        { id: 'Child-1.1' },
        {
          id: 'Child-1.2',
          children: [
            { id: 'Child-1.2.1' },
            {
              id: 'Child-1.2.2',
              children: [
                { id: 'Foo-1' },
                { id: 'Foo-2' },
                { id: 'Foo-3', children: [{ id: 'Foo-3.1' }] },
              ],
            },
          ],
        },
        { id: 'Child-1.3' },
      ],
    },
    {
      id: 'Root-2',
      props: { treeview: { inline: {} } },
      children: [
        { id: 'Child-2.1' },
        {
          id: 'Child-2.2',
          children: [
            { id: 'Bar-1' },
            { id: 'Bar-2' },
            { id: 'Bar-3', children: [{ id: 'Bar-3.1' }, { id: 'Bar-3.2' }] },
          ],
        },
        { id: 'Child-2.3' },
      ],
    },
    { id: 'Root-3' },
  ],
};

export type ITestProps = { style?: CssValue };
export type ITestState = { total?: number };

export class Test extends React.PureComponent<ITestProps, ITestState> {
  public state: ITestState = {};
  private state$ = new Subject<Partial<ITestState>>();

  private unmounted$ = new Subject();
  private treeview$ = new Subject<t.TreeviewEvent>();
  private tree = Tree.State.create({ root: DEFAULT, dispose$: this.unmounted$ });

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    const fire: t.FireEvent<t.TreeviewEvent> = (e) => this.treeview$.next(e);
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));

    const tree = this.tree;
    const event = Tree.View.events(this.treeview$, this.unmounted$);
    const changed$ = tree.event.changed$.pipe(takeUntil(this.unmounted$));
    changed$.pipe(debounceTime(10)).subscribe(() => this.forceUpdate());

    const before = event.beforeRender;
    merge(before.node$, before.header$).subscribe((e) => {
      e.change((props) => {
        if (!props.label) {
          props.label = Tree.View.Identity.key(e.node.id); // NB: Make sample node labels readable (remove namespace).
        }
      });
    });

    /**
     * State / Behavior Strategy
     */
    const strategy = Tree.Strategy.default({ fire });
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

  public get nav() {
    return this.tree.state.props?.treeview?.nav || {};
  }

  public get current() {
    return this.nav.current;
  }

  public get selected() {
    return this.nav.selected;
  }

  public get total() {
    return this.state.total || 2;
  }

  /**
   * [Render]
   */
  public render() {
    const total = this.total;
    const styles = {
      base: css({ Absolute: 0 }),
      outer: css({
        Absolute: 80,
        border: `solid 1px ${color.format(-0.1)}`,
        borderRight: 'none',
        display: 'flex',
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        {this.renderToolbar()}
        <div {...styles.outer}>
          <Tree.Columns
            total={total}
            root={this.tree.state}
            current={this.current}
            event$={this.treeview$}
            background={'NONE'}
            tabIndex={0}
            focusOnLoad={true}
          />
        </div>
      </div>
    );
  }

  private renderToolbar() {
    const total = this.total;
    const styles = {
      base: css({
        Absolute: [0, 0, null, 0],
        height: 40,
        padding: 10,
        PaddingX: 15,
        Flex: 'horizontal-center-spaceBetween',
        boxSizing: 'border-box',
      }),
      spacer: css({ width: 20 }),
      left: css({ Flex: 'horizontal-center-center' }),
      selected: css({
        color: color.format(-0.3),
      }),
    };

    const elList = Array.from({ length: 4 })
      .map((v, i) => i)
      .slice(1)
      .map((i) => {
        const count = i + 1;
        const style = count === total ? styles.selected : undefined;
        const onClick = this.totalColumnsHandler(count);
        return (
          <React.Fragment key={i}>
            <Button onClick={onClick} style={style}>
              {count}-column
            </Button>
            <div {...styles.spacer}></div>
          </React.Fragment>
        );
      });

    return (
      <div {...styles.base}>
        <div {...styles.left}>{elList}</div>
      </div>
    );
  }

  /**
   * [Handlers]
   */

  private totalColumnsHandler = (total: number) => {
    return () => {
      this.state$.next({ total });
    };
  };
}
