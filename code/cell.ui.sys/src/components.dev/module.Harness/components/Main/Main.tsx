import * as React from 'react';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { color, css, CssValue, t, ui } from '../../common';
import { HarnessModule } from '../../Module';

type P = t.HarnessProps;
type V = t.HarnessView;

export type IMainProps = {
  style?: CssValue;
};

export class Main extends React.PureComponent<IMainProps> {
  private unmounted$ = new Subject();

  public static contextType = ui.Context;
  public context!: t.IEnvContext;
  private module!: t.HarnessModule;
  private treeview$ = new Subject<t.TreeviewEvent>();

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.init();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  private init() {
    const ctx = this.context;
    this.module = HarnessModule.init(ctx.bus);

    // Setup event monitor.
    const tree = ui.ModuleView.Tree.events(this.treeview$, this.unmounted$);

    // Prevent header from being drawn on root harness node.
    tree.beforeRender.header$.pipe(filter((e) => e.node.id === this.module.id)).subscribe((e) => {
      e.change((draft) => {
        const header = draft.header || (draft.header = {});
        header.isVisible = false;
      });
    });

    // NB: Redraw causes the newly created [module] to be drawn.
    this.forceUpdate();
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Absolute: 0,
        Flex: 'horizontal-stretch-stretch',
        boxSizing: 'border-box',
      }),
      fill: css({ Absolute: 0 }),
      left: css({
        WebkitAppRegion: 'drag',
        position: 'relative',
        display: 'flex',
        width: 250,
        backgroundColor: color.format(1),
      }),
      body: css({
        position: 'relative',
        flex: 1,
      }),
      right: css({
        WebkitAppRegion: 'drag',
        width: 250,
        backgroundColor: color.format(1),
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.left}>
          {/* <ui.ModuleView.Frame style={styles.fill} filter={this.rootTree} bus={this.bus} /> */}
          <ui.ModuleView.Tree module={this.module} treeview$={this.treeview$} />
        </div>
        <div {...styles.body}>{this.renderMainTemp()}</div>
        <div {...styles.right}></div>
      </div>
    );
  }

  private renderMainTemp() {
    const styles = {
      base: css({
        Absolute: 0,
        display: 'flex',
      }),
      body: css({
        flex: 1,
        Flex: 'center-center',
        border: `dashed 2px ${color.format(1)}`,
        borderRadius: 15,
        margin: 30,
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.body}>Main</div>
      </div>
    );
  }

  /**
   * [Handlers]
   */

  // private rootTree: t.ModuleFilterView<V> = (e) => {
  //   return e.module === this.module.id && (e.view === 'TREE' || e.view === '404');
  // };
}
