import { themes, Treeview } from '@platform/ui.tree';
import * as React from 'react';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { color, COLORS, Context, css, R, t } from '../common';

const DARK = R.clone(themes.DARK);
DARK.header = {
  ...DARK.header,
  bg: COLORS.DARK,
  borderBottomColor: color.format(0.1) as string,
};

export type ITreeProps = {
  tree$: Subject<t.TreeviewEvent>;
};

export class Tree extends React.PureComponent<ITreeProps> {
  private unmounted$ = new Subject();

  public static contextType = Context;
  public context!: t.IShellContext;

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    this.model.changed$
      .pipe(takeUntil(this.unmounted$), debounceTime(0))
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
        <Treeview
          root={this.model.root}
          current={this.model.current}
          theme={DARK}
          background={'NONE'}
          renderIcon={this.renderIcon}
          renderPanel={this.renderPanel}
          renderNodeBody={this.renderNode}
          event$={this.props.tree$}
          tabIndex={0}
        />
      </div>
    );
  }

  /**
   * [Handlers]
   */

  private renderIcon: t.RenderTreeIcon = (e) => {
    const render = this.model.render;
    return render && render.icon ? render.icon(e) : undefined;
  };

  private renderPanel: t.RenderTreePanel = (e) => {
    const render = this.model.render;
    return render && render.panel ? render.panel(e) : undefined;
  };

  private renderNode: t.RenderTreeNodeBody = (e) => {
    const render = this.model.render;
    return render && render.node ? render.node(e) : undefined;
  };
}
