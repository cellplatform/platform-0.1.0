import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, CssValue, t, ui, Module, color } from '../../common';
import { HarnessModule } from '../../Module';

type P = t.HarnessProps;
type V = t.HarnessView;

export type IMainProps = {
  style?: CssValue;
};
// export type IMainState = { module?: t.HarnessModule };

export class Main extends React.PureComponent<IMainProps> {
  // public state: IMainState = {};
  // private state$ = new Subject<Partial<IMainState>>();
  private unmounted$ = new Subject();

  public static contextType = ui.Context;
  public context!: t.IEnvContext;
  private module!: t.HarnessModule;

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    // this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
    this.init();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  private init() {
    this.module = HarnessModule.init(this.bus);
    this.forceUpdate();

    // const fire = Module.fire<P>(this.bus);
    // fire.render({ module, view: 'TREE', notFound: '404' });

    const module = this.module;

    // TEMP 🐷
    module.change((draft) => {
      draft.children = draft.children || [];
      draft.children.push({ id: 'foo' }, { id: 'bar' });
    });
  }

  /**
   * [Properties]
   */
  public get bus(): t.EventBus<any> {
    const { event$, fire } = this.context;
    return { event$, fire };
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Absolute: 0,
        WebkitAppRegion: 'drag',
        Flex: 'horizontal-stretch-stretch',
        boxSizing: 'border-box',
      }),
      fill: css({ Absolute: 0 }),
      left: css({
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
        width: 250,
        backgroundColor: color.format(1),
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.left}>
          {/* <ui.ModuleView.Frame style={styles.fill} filter={this.rootTree} bus={this.bus} /> */}
          <ui.ModuleView.Tree module={this.module} />
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
