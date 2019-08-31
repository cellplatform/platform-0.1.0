import { themes, TreeView } from '@platform/ui.tree';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, COLORS, Context, css, log, R, t } from '../../common';

const DARK = R.clone(themes.DARK);
DARK.header = {
  ...DARK.header,
  bg: COLORS.DARK,
  borderBottomColor: color.format(0.1) as string,
};

// TEMP 🐷
const ROOT: t.ITreeNode = {
  id: 'ROOT',
  props: { label: 'Title' },
  children: [{ id: 'one' }, { id: 'two' }],
};

export type ITreeProps = {};
export type ITreeState = { root?: t.ITreeNode; current?: string };

export class Tree extends React.PureComponent<ITreeProps, ITreeState> {
  public state: ITreeState = { root: ROOT };
  private state$ = new Subject<Partial<ITreeState>>();
  private unmounted$ = new Subject<{}>();
  private events$ = new Subject<t.TreeViewEvent>();

  public static contextType = Context;
  public context!: t.IShellContext;

  /**
   * [Lifecycle]
   */
  constructor(props: ITreeProps) {
    super(props);
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));

    // Setup observables.
    const events$ = this.events$.pipe(takeUntil(this.unmounted$));
    const tree = TreeView.events(events$);

    tree.mouse().click.node$.subscribe(async e => {
      // TEMP 🐷
      const { shell } = this.context;

      if (e.id === 'one') {
        const res = await this.context.shell.load('A');
        console.log('-------------------------------------------');
        console.log('res', res);
        // shell.state.body.el = el;
      }

      if (e.id === 'two') {
        const res = await this.context.shell.load('B');
        console.log('-------------------------------------------');
        console.log('res', res);
      }
    });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({ Absolute: 0, display: 'flex' }),
    };
    return (
      <div {...styles.base}>
        <TreeView
          node={this.state.root}
          current={this.state.current}
          theme={DARK}
          background={'NONE'}
          renderIcon={this.renderIcon}
          renderPanel={this.renderPanel}
          renderNodeBody={this.renderNodeBody}
          events$={this.events$}
          tabIndex={0}
        />
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private renderIcon: t.RenderTreeIcon = e => undefined; // Icons[e.icon];
  private renderPanel: t.RenderTreePanel<t.ITreeNode> = e => undefined;
  private renderNodeBody: t.RenderTreeNodeBody = e => undefined;
}
