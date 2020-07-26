import { color, css, CssValue } from '@platform/css';
import { Button } from '@platform/ui.button';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TreeView } from '../..';
import { t } from '../../common';
import { TreeViewNavigation } from '../../TreeViewNavigation';
import { Icons } from './Icons';
import { TreeViewState } from '../../components.dev/TreeViewState';

type Node = t.ITreeViewNode;

const ROOT: Node = {
  id: 'root',
  props: {
    label: 'Root',
    header: { isVisible: false },
  },
  children: [
    {
      id: 'child-1',
      props: {
        label: 'Child-1',
        marginTop: 45,
      },
    },
  ],
};

export type ITestProps = { style?: CssValue };
export type ITestState = {
  root?: t.ITreeViewNode;
  current?: string;
};

export class Test extends React.PureComponent<ITestProps, ITestState> {
  public state: ITestState = { root: ROOT };
  private state$ = new Subject<Partial<ITestState>>();
  private unmounted$ = new Subject();
  private treeview$ = new Subject<t.TreeViewEvent>();

  private store = TreeView.State.create({ root: ROOT, dispose$: this.unmounted$ });
  private nav = TreeViewNavigation.create({
    tree: this.store,
    treeview$: this.treeview$,
    dispose$: this.unmounted$,
    strategy: TreeViewNavigation.strategies.default,
  });

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
    this.store.event.changed$
      .pipe(takeUntil(this.unmounted$))
      .subscribe((e) => this.state$.next({ root: e.to }));

    this.nav.redraw$.pipe(takeUntil(this.unmounted$)).subscribe((e) => {
      this.forceUpdate();
    });
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
        backgroundColor: color.format(0.5),
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        {this.renderTree('left')}
        {this.renderCenter()}
        {this.renderTree('right')}
      </div>
    );
  }

  private renderTree(edge: 'left' | 'right') {
    const styles = {
      base: css({
        width: 280,
        display: 'flex',
        borderLeft: edge === 'right' && `solid 1px ${color.format(-0.1)}`,
        borderRight: edge === 'left' && `solid 1px ${color.format(-0.1)}`,
        WebkitAppRegion: 'drag',
      }),
    };
    return (
      <div {...styles.base}>
        <TreeView
          root={this.nav.root}
          current={this.nav.current}
          event$={this.treeview$}
          renderIcon={this.renderIcon}
          background={'NONE'}
          tabIndex={0}
        />
      </div>
    );
  }

  private renderCenter() {
    const styles = {
      base: css({
        flex: 1,
        position: 'relative',
        boxSizing: 'border-box',
        backgroundColor: color.format(1),
        Flex: 'vertical-stretch-stretch',
      }),
      toolbar: css({
        position: 'relative',
        height: 34,
        borderBottom: `solid 1px ${color.format(-0.1)}`,
        Flex: 'horizontal-center-start',
        fontSize: 14,
        PaddingX: 15,
      }),
      body: css({
        position: 'relative',
        flex: 1,
      }),
      scroll: css({
        Absolute: 0,
        padding: 30,
        paddingTop: 80,
        PaddingX: 50,
        Scroll: true,
        paddingBottom: 100,
      }),
    };

    return (
      <div {...styles.base}>
        <div {...styles.toolbar}>
          <Button onClick={this.onRedrawClick}>Redraw</Button>
        </div>
        <div {...styles.body}>
          <div {...styles.scroll}>
            <TreeViewState store={this.store} />
          </div>
        </div>
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private renderIcon: t.RenderTreeIcon = (e) => Icons[e.icon];

  private onRedrawClick = () => {
    this.forceUpdate();
  };
}
