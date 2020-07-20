import { color, css, CssValue } from '@platform/css';
import { Button } from '@platform/ui.button';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TreeView } from '../..';
import { t } from '../../common';
import { Icons } from './Icons';

type Node = t.ITreeNode;
const State = TreeView.State;
const ROOT: Node = {
  id: 'root',
  props: { label: 'Root' },
  children: [{ id: 'child-1', props: { label: 'Child-1' } }],
};

export type ITestProps = { style?: CssValue };
export type ITestState = { root?: t.ITreeNode; current?: string };

export class Test extends React.PureComponent<ITestProps, ITestState> {
  public state: ITestState = { root: ROOT };
  private state$ = new Subject<Partial<ITestState>>();
  private unmounted$ = new Subject();
  private event$ = new Subject<t.TreeViewEvent>();

  private rootState = TreeView.State.create({ root: ROOT, dispose$: this.unmounted$ });

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
    this.rootState.changed$
      .pipe(takeUntil(this.unmounted$))
      .subscribe((e) => this.state$.next({ root: e.to }));
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
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        {this.renderTree('left')}
        {this.renderRight()}
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
      }),
    };
    return (
      <div {...styles.base}>
        <TreeView
          node={this.state.root}
          current={this.state.current}
          event$={this.event$}
          renderIcon={this.renderIcon}
          tabIndex={0}
        />
      </div>
    );
  }

  private renderRight() {
    const styles = {
      base: css({
        boxSizing: 'border-box',
        padding: 30,
        flex: 1,
      }),
    };
    return (
      <div {...styles.base}>
        <Button onClick={this.addChildOfRoot}>add: child state</Button>
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private renderIcon: t.RenderTreeIcon = (e) => Icons[e.icon];

  private addChildOfRoot = () => {
    const root = { id: 'foo', props: { label: 'Foo' } };
    const child = this.rootState.add({ root });

    child.change((draft, ctx) => {
      const children = State.children(draft);
      children.push({ id: 'my-child', props: { label: 'hello' } });
    });

    console.group('🌳 child added');
    console.log('child', child);
    console.log('child.root', child.root);
    console.groupEnd();
  };
}
