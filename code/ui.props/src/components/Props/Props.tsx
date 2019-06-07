import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { css, GlamorValue, Icons, t, TreeView, util } from '../common';
import { PropEditor } from '../PropEditor';

const BODY = {
  PROD_EDITOR: 'PROP_EDITOR',
};

export type ChangedEventHandler = (e: t.IPropsChange) => void;

export type IPropsProps = {
  data?: t.PropsData;
  theme?: t.PropsTheme;
  style?: GlamorValue;
  events$?: Subject<t.PropsEvent>;
  onChange?: ChangedEventHandler;
};
export type IPropsState = {};

export class Props extends React.PureComponent<IPropsProps, IPropsState> {
  private state$ = new Subject<Partial<IPropsState>>();
  private unmounted$ = new Subject();
  private events$ = new Subject<t.PropsEvent>();

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const events$ = this.events$.pipe(takeUntil(this.unmounted$));
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));

    if (this.props.events$) {
      this.events$.subscribe(this.props.events$);
    }

    events$
      .pipe(
        filter(e => Boolean(this.props.onChange)),
        filter(e => e.type === 'PROPS/changed'),
        map(e => e.payload as t.IPropsChange),
      )
      .subscribe(e => {
        if (this.props.onChange) {
          this.props.onChange(e);
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
  public get theme() {
    const { theme = 'DARK' } = this.props;
    return theme;
  }

  private get root() {
    const root: t.IPropNode = { id: 'ROOT', props: { header: { isVisible: false } } };
    const body = BODY.PROD_EDITOR;
    return util.buildTree({
      root,
      parent: root,
      data: this.props.data,
      formatNode: node => ({ ...node, props: { ...node.props, body } }),
    });
  }

  /**
   * [Render]
   */
  public render() {
    const theme = this.theme;
    const styles = {
      base: css({
        position: 'relative',
        display: 'flex',
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <TreeView
          node={this.root}
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
    if (e.body === BODY.PROD_EDITOR) {
      const node = e.node as t.IPropNode;
      return (
        <PropEditor
          rootData={this.props.data}
          node={node}
          theme={this.theme}
          events$={this.events$}
        />
      );
    }
    return null;
  };
}
