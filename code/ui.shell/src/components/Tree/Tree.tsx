import { themes, TreeView } from '@platform/ui.tree';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

import { color, COLORS, Context, css, log, R, t } from '../common';

const DARK = R.clone(themes.DARK);
DARK.header = {
  ...DARK.header,
  bg: COLORS.DARK,
  borderBottomColor: color.format(0.1) as string,
};

export type ITreeProps = {
  tree$: Subject<t.TreeViewEvent>;
};
export type ITreeState = {};

export class Tree extends React.PureComponent<ITreeProps, ITreeState> {
  public state: ITreeState = {};
  private state$ = new Subject<Partial<ITreeState>>();
  private unmounted$ = new Subject<{}>();
  // private events$ = new Subject<t.TreeViewEvent>();

  public static contextType = Context;
  public context!: t.IShellContext;

  /**
   * [Lifecycle]
   */
  constructor(props: ITreeProps) {
    super(props);
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));

    // Setup observables.
    // const events$ = this.events$.pipe(takeUntil(this.unmounted$));
    // const tree = TreeView.events(events$);

    // tree.mouse().click.node$.subscribe(async e => {
    //   // TEMP 🐷
    //   log.group('Tree Click');
    //   log.info(e);
    //   log.info('context', this.context);
    //   log.groupEnd();
    // });
  }

  public componentDidMount() {
    this.model.changed$
      .pipe(
        takeUntil(this.unmounted$),
        debounceTime(0),
      )
      .subscribe(() => this.forceUpdate());
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get model() {
    return this.context.shell.state.tree as t.IObservableProps<t.IShellTreeState>;
  }

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
          node={this.model.root}
          current={this.model.current}
          theme={DARK}
          background={'NONE'}
          renderIcon={this.renderIcon}
          renderPanel={this.renderPanel}
          renderNodeBody={this.renderNodeBody}
          events$={this.props.tree$}
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
