import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import * as sample from '../sample';
import { Button, color, COLORS, css, ObjectView, t, TreeView, Foo, log } from '../common';
import { Icons } from './Icons';

export type ITestState = {
  theme?: t.TreeTheme;
  root?: t.ITreeNode;
  current?: string;
};
export class Test extends React.PureComponent<{}, ITestState> {
  /**
   * [Fields]
   */
  public state: ITestState = {
    root: sample.COMPREHENSIVE,
    theme: 'LIGHT',
    // current: 'root.1.1',
  };
  private unmounted$ = new Subject<{}>();
  private state$ = new Subject<Partial<ITestState>>();
  private events$ = new Subject<t.TreeViewEvent>();
  private mouse$ = new Subject<t.TreeNodeMouseEvent>();

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    // Setup observables.
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    const events$ = this.events$.pipe(takeUntil(this.unmounted$));
    const mouse$ = this.mouse$.pipe(takeUntil(this.unmounted$));
    const click$ = mouse$.pipe(filter(e => e.button === 'LEFT'));

    /**
     * NB: Alternative helper for pealing off events.
     */
    const tree = TreeView.events(events$);
    tree.mouse().click.node$.subscribe(e => {
      log.info('🐷 CLICK from TreeEvents helper', e);
    });

    // Update state.
    state$.subscribe(e => this.setState(e));

    // Log events.
    events$.subscribe(e => {
      log.info('🌳', e.type, e.payload);
    });

    /**
     * Handle mouse.
     */

    const toggle = (node: t.ITreeNode) => {
      const toggled = TreeView.util.toggleIsOpen(this.state.root, node);
      this.state$.next({ root: toggled });
    };

    click$
      .pipe(
        filter(e => e.type === 'DOWN'),
        filter(e => e.target === 'DRILL_IN'),
      )
      .subscribe(e => this.state$.next({ current: e.id }));

    click$
      .pipe(
        filter(e => e.type === 'DOWN'),
        filter(e => e.target === 'TWISTY'),
      )
      .subscribe(e => toggle(e.node));

    click$
      .pipe(
        filter(e => e.type === 'DOUBLE_CLICK'),
        filter(e => e.target === 'NODE'),
      )
      .subscribe(e => this.state$.next({ current: e.id }));

    click$
      .pipe(
        filter(e => e.type === 'DOUBLE_CLICK'),
        filter(e => e.target === 'NODE'),
        filter(e => Boolean(e.props.inline)),
      )
      .subscribe(e => toggle(e.node));

    click$
      .pipe(
        filter(e => e.type === 'DOWN'),
        filter(e => e.target === 'PARENT'),
      )
      .subscribe(e => {
        const args = { inline: false };
        const parent = TreeView.util.parent(this.state.root, e.node, args);
        return this.state$.next({ current: parent ? parent.id : undefined });
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
    const { theme } = this.state;
    const styles = {
      base: css({
        Absolute: 0,
        Flex: 'horizontal',
      }),
      left: css({
        width: 200,
        Flex: 'vertical-spaceBetween',
        lineHeight: 1.8,
        fontSize: 12,
        padding: 10,
        borderRight: `solid 1px ${color.format(-0.1)}`,
        backgroundColor: color.format(-0.02),
      }),
      right: css({
        backgroundColor: theme === 'DARK' ? COLORS.DARK : undefined,
        position: 'relative',
        Flex: 'horizontal-start-center',
        flex: 1,
      }),
      rightCenter: css({
        height: '100%',
        width: 300,
        display: 'flex',
      }),
    };

    return (
      <div {...styles.base}>
        <div {...styles.left}>
          <div>
            {this.button('theme: LIGHT', () => this.state$.next({ theme: 'LIGHT' }))}
            {this.button('theme: DARK', () => this.state$.next({ theme: 'DARK' }))}
          </div>
          <ObjectView name={'tree'} data={this.state.root} />
        </div>
        <div {...styles.right}>
          <div {...styles.rightCenter}>{this.renderTree()}</div>
        </div>
      </div>
    );
  }

  private renderTree() {
    const { theme } = this.state;
    const borderColor = theme === 'DARK' ? color.format(0.2) : color.format(-0.1);
    const border = `solid 1px ${borderColor}`;
    const styles = {
      base: css({
        flex: 1,
        display: 'flex',
        borderLeft: border,
        borderRight: border,
      }),
    };
    return (
      <div {...styles.base}>
        <TreeView
          node={this.state.root}
          current={this.state.current}
          theme={this.state.theme}
          background={'NONE'}
          renderIcon={this.renderIcon}
          renderPanel={this.renderPanel}
          renderNodeBody={this.renderNodeBody}
          events$={this.events$}
          mouse$={this.mouse$}
          tabIndex={0}
        />
      </div>
    );
  }

  private button = (label: string, handler: () => void) => {
    return <Button label={label} onClick={handler} block={true} />;
  };

  /**
   * [Handlers]
   */
  private renderIcon: t.RenderTreeIcon = e => Icons[e.icon];

  private renderNodeBody: t.RenderTreeNodeBody = e => {
    const styles = {
      base: css({
        backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
        flex: 1,
        border: `dashed 1px ${color.format(-0.1)}`,
        borderRadius: 4,
        Flex: 'center-center',
        fontSize: 11,
      }),
    };
    return (
      <div {...styles.base}>
        <div>{e.body}</div>
      </div>
    );
    return null;
  };

  private renderPanel: t.RenderTreePanel<t.ITreeNode> = e => {
    /**
     * NOTE:  Use this flag to revent custom panel rendering if
     *        the node is opened "inline" within it's parent.
     */
    if (e.isInline) {
      // return undefined;
    }

    const match = ['root.2', 'root.3', 'foo'];
    if (match.includes(e.node.id)) {
      const styles = {
        base: css({
          flex: 1,
          lineHeight: '1.6em',
          padding: 2,
        }),
        link: css({ color: COLORS.BLUE, cursor: 'pointer' }),
      };
      return (
        <div {...styles.base}>
          <Foo style={{ flex: 1, lineHeight: '1.6em' }}>
            <div>My Custom Panel: {e.node.id}</div>
            <div onClick={this.handleHomeClick} {...styles.link}>
              Home
            </div>
          </Foo>
        </div>
      );
    }
    return undefined;
  };

  private handleHomeClick = () => {
    this.state$.next({ current: 'root' });
  };
}
