import * as React from 'react';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { Body } from '../Body';
import { COLORS, Context, css, DEFAULT, CssValue, t, util } from '../common';
import { Sidebar } from '../Sidebar';
import { Tree } from '../Tree';

const SHELL = DEFAULT.STATE.SHELL;

export type IRootColumnsProps = {
  tree$: Subject<t.TreeViewEvent>;
  style?: CssValue;
};
export type IRootColumnsState = {};

export class RootColumns extends React.PureComponent<IRootColumnsProps, IRootColumnsState> {
  public state: IRootColumnsState = {};
  private state$ = new Subject<Partial<IRootColumnsState>>();
  private unmounted$ = new Subject<{}>();

  public static contextType = Context;
  public context!: t.IShellContext;

  /**
   * [Lifecycle]
   */
  constructor(props: IRootColumnsProps) {
    super(props);
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
    this.model.changed$
      .pipe(takeUntil(this.unmounted$), debounceTime(0))
      .subscribe(e => this.forceUpdate());
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  private get model() {
    return this.context.shell.state;
  }

  private get width() {
    const model = this.model;
    return {
      tree: util.toSize(model.tree.width, SHELL.tree.width),
      sidebar: util.toSize(model.sidebar.width, SHELL.sidebar.width),
    };
  }

  /**
   * [Render]
   */
  public render() {
    const width = this.width;
    const styles = {
      base: css({
        flex: 1,
        Flex: 'horizontal-stretch-stretch',
      }),
      left: css({
        position: 'relative',
        backgroundColor: COLORS.DARK,
        width: width.tree.value,
        transition: `width ${width.tree.speed}ms`,
      }),
      middle: css({
        flex: 1,
        position: 'relative',
        backgroundColor: COLORS.WHITE,
      }),
      right: css({
        position: 'relative',
        backgroundColor: COLORS.DARK,
        width: width.sidebar.value,
        transition: `width ${width.sidebar.speed}ms`,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.left}>
          <Tree tree$={this.props.tree$} />
        </div>
        <div {...styles.middle}>
          <Body />
        </div>
        <div {...styles.right}>
          <Sidebar />
        </div>
      </div>
    );
  }
}
