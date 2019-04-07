import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { color, COLORS, css, t } from '../../src/common';
import { TreeView } from '../../src/components/primitives';
import { init as initCommandLine } from '../cli';
import { Icons } from './Icons';
import { CommandTree } from '../../src/components/CommandTree';

const cli = initCommandLine({});

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
  private mouse$ = new Subject<t.TreeNodeMouseEvent>();
  private events$ = new Subject<t.CommandTreeEvent>();

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
    const events$ = this.events$.pipe(takeUntil(this.unmounted$));

    events$.subscribe(e => {
      console.log('🌳', e.type, e.payload);
    });

    const mouse$ = this.mouse$.pipe(
      takeUntil(this.unmounted$),
      filter(e => e.button === 'LEFT'),
    );

    const click$ = mouse$.pipe(filter(e => e.type === 'DOWN'));

    mouse$.subscribe(e => {
      // console.log('e', e);
    });

    mouse$
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
    this.unmounted$.complete();
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
        borderRight: `solid 1px ${color.format(0.25)}`,
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.tree}>
          <CommandTree root={cli.root} theme={'DARK'} background={'NONE'} events={this.events$} />

          {/* <TreeView
            node={this.state.tree}
            current={this.state.current}
            theme={'DARK'}
            background={'NONE'}
            renderIcon={this.renderIcon}
            mouseEvents$={this.mouse$}
          /> */}
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

/**
 * Builds a <TreeView> data structure for the given command.
 */
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

  return parent;
}
