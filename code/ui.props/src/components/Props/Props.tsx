import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, GlamorValue, t, Text, TreeView, Icons } from '../common';
import * as themes from './themes';

const TMP: t.ITreeNode = {
  id: 'ROOT',
  props: { header: { isVisible: false } },
  children: [
    { id: 'FOO', props: { label: 'Foo', icon: 'Box' } },
    { id: 'BAR', props: { label: 'Bar', body: 'FOO' } },
    { id: 'ZOO', props: { label: 'Zoo', body: 'FOO' } },
  ],
};

export type IPropsProps = {
  theme?: t.PropsTheme;
  style?: GlamorValue;
};
export type IPropsState = {
  root?: t.ITreeNode;
};

export class Props extends React.PureComponent<IPropsProps, IPropsState> {
  public state: IPropsState = { root: TMP };
  private state$ = new Subject<Partial<IPropsState>>();
  private unmounted$ = new Subject();

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));
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
    const { theme = 'DARK' } = this.props;
    const styles = {
      base: css({
        position: 'relative',
        display: 'flex',
      }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        <TreeView
          node={this.state.root}
          current={'ROOT'}
          theme={theme}
          renderIcon={this.iconFactory}
          renderNodeBody={this.nodeFactory}
        />
      </div>
    );
  }

  private iconFactory: t.RenderTreeIcon = e => Icons[e.icon];

  private nodeFactory: t.RenderTreeNodeBody = e => {
    console.log('e', e);
    const styles = {
      base: css({
        color: 'white',
        backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
        flex: 1,
      }),
    };
    return (
      <div {...styles.base}>
        <div>Foo</div>
      </div>
    );
  };
}
