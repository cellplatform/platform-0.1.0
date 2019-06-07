import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { css, GlamorValue, Icons, t, TreeView, util } from '../common';
import { PropEditor } from '../PropEditor';

const ROOT = 'ROOT';
const BODY = {
  PROD_EDITOR: 'PROP_EDITOR',
};

export type ChangedEventHandler = (e: t.IPropsChange) => void;

export type IPropsProps = {
  data?: t.PropsData;
  // path?: string;
  theme?: t.PropsTheme;
  style?: GlamorValue;
  events$?: Subject<t.PropsEvent>;
  onChange?: ChangedEventHandler;
};
export type IPropsState = {
  current?: string;
};

export class Props extends React.PureComponent<IPropsProps, IPropsState> {
  public state: IPropsState = { current: ROOT };
  private state$ = new Subject<Partial<IPropsState>>();
  private unmounted$ = new Subject();
  private events$ = new Subject<t.PropsEvent>();
  private tree$ = new Subject<t.TreeViewEvent>();

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const tree$ = this.tree$.pipe(takeUntil(this.unmounted$));
    const events$ = this.events$.pipe(takeUntil(this.unmounted$));
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));

    if (this.props.events$) {
      this.events$.subscribe(this.props.events$);
    }

    /**
     * Bubble events.
     */
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

    /**
     * Mouse events on tree.
     */
    const treeMouse$ = tree$.pipe(
      filter(e => e.type === 'TREEVIEW/mouse'),
      map(e => e.payload as t.TreeNodeMouseEvent),
    );
    const treeClick$ = treeMouse$.pipe(
      filter(e => e.type === 'CLICK'),
      filter(e => e.button === 'LEFT'),
    );
    const treeDblClick$ = treeMouse$.pipe(
      filter(e => e.type === 'DOUBLE_CLICK'),
      filter(e => e.button === 'LEFT'),
    );

    treeClick$.pipe(filter(e => e.target === 'DRILL_IN')).subscribe(e => {
      const current = e.node.id;
      this.state$.next({ current });
    });

    treeClick$.pipe(filter(e => e.target === 'PARENT')).subscribe(e => {
      const id = e.node.id;
      const current = id.substring(0, id.lastIndexOf('.'));
      this.state$.next({ current });
    });

    treeDblClick$
      .pipe(
        filter(e => e.target === 'NODE'),
        filter(e => Boolean(e.node && e.node.children && e.node.children.length > 0)),
        filter(e =>
          ['object', 'array'].includes(util.getType((e.node.data as t.IPropNodeData).value)),
        ),
      )
      .subscribe(e => {
        const current = e.node.id;
        this.state$.next({ current });
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
    const root: t.IPropNode = { id: ROOT, props: { header: { isVisible: false } } };
    const body = BODY.PROD_EDITOR;
    return util.buildTree({
      root,
      parent: root,
      data: this.props.data,
      formatNode: node => ({ ...node, props: { ...node.props, body } }),
    });
  }

  /**
   * [Methods]
   */
  // private setCurrent(node: t.ITreeNode) {
  //   const id = node.id;
  //   const current = id.substring(0, id.lastIndexOf('.'));
  //   this.state$.next({ current });
  // }

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
          current={this.state.current}
          theme={theme}
          renderIcon={this.iconFactory}
          renderNodeBody={this.nodeFactory}
          events$={this.tree$}
        />
      </div>
    );
  }

  private iconFactory: t.RenderTreeIcon = e => Icons[e.icon];

  private nodeFactory: t.RenderTreeNodeBody = e => {
    if (e.body === BODY.PROD_EDITOR) {
      const node = e.node as t.IPropNode;
      const parentNode = TreeView.util.parent(this.root, node) as t.IPropNode;
      return (
        <PropEditor
          rootData={this.props.data}
          parentNode={parentNode}
          node={node}
          theme={this.theme}
          events$={this.events$}
        />
      );
    }
    return null;
  };
}
