import { merge, Observable, Subject, BehaviorSubject } from 'rxjs';
import {
  takeUntil,
  take,
  takeWhile,
  map,
  filter,
  share,
  delay,
  distinctUntilChanged,
  debounceTime,
} from 'rxjs/operators';
import * as React from 'react';

import { COLORS, css, t } from '../../src/common';
import { TreeView } from '../../src/components/primitives';
import { init as initCommandLine } from '../cli';
import { Icons } from './Icons';

const cli = initCommandLine({});

const TREE: t.ITreeNode = {
  id: 'root',
  props: {
    label: 'Sheet',
    icon: 'Face',
    header: { isVisible: false },
  },
  children: [
    { id: 'child-1', props: { icon: 'Face', marginTop: 30 } },
    { id: 'child-2', props: { icon: 'Face' } },
    { id: 'child-3', props: { icon: 'Face' } },
    { id: 'child-4', props: { icon: 'Face' } },
    { id: 'child-5', props: { icon: 'Face' } },
  ],
};

/**
 * Test Component
 */
export type ITestTreeState = {
  tree?: t.ITreeNode;
  current?: string;
};

export class TestTree extends React.PureComponent<{}, ITestTreeState> {
  public state: ITestTreeState = { tree: buildTree(cli.root) };
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ITestTreeState>>();
  private mouseEvents$ = new Subject<t.TreeNodeMouseEvent>();

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));

    const mouseEvents$ = this.mouseEvents$.pipe(
      takeUntil(this.unmounted$),
      filter(e => e.button === 'LEFT'),
    );

    const click$ = mouseEvents$.pipe(filter(e => e.type === 'DOWN'));

    mouseEvents$.subscribe(e => {
      console.log('e', e);
    });

    mouseEvents$
      // Drill into child node.
      .pipe(
        filter(
          e =>
            (e.type === 'DOUBLE_CLICK' && e.target === 'NODE') ||
            (e.type === 'DOWN' && e.target === 'DRILL_IN'),
        ),
        filter(e => (e.node.children || []).length > 0),
      )
      .subscribe(e => this.state$.next({ current: e.node.id }));

    click$
      // Step up to parent.
      .pipe(filter(e => e.target === 'PARENT'))
      .subscribe(e => {
        const parent = TreeView.util.parent(this.state.tree, e.node);
        const current = parent ? parent.id : undefined;
        this.state$.next({ current });
      });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  public render() {
    const styles = {
      base: css({
        flex: 1,
        Flex: 'horizontal',
        backgroundColor: COLORS.DARK,
      }),
      tree: css({
        width: 240,
        display: 'flex',
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.tree}>
          <TreeView
            node={this.state.tree}
            current={this.state.current}
            theme={'DARK'}
            background={'NONE'}
            renderIcon={this.renderIcon}
            mouseEvents$={this.mouseEvents$}
          />
        </div>
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private renderIcon: t.RenderTreeIcon = e => {
    return Icons[e.icon];
  };
}

function buildTree(command: t.ICommand, options: { parent?: t.ITreeNode } = {}) {
  const parent: t.ITreeNode = options.parent || {
    id: `cmd:${command.id}`,
    props: { label: 'Commands' },
  };

  parent.children = command.children.map(cmd => {
    const node: t.ITreeNode = {
      id: `cmd:${cmd.id}`,
      props: {
        label: cmd.name,
        icon: 'Face',
      },
    };

    if (cmd.children.length > 0) {
      buildTree(cmd, { parent: node });
    }
    return node;
  });

  console.log('root', command);

  return parent;
}
