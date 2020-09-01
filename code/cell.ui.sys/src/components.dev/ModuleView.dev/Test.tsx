import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Icons } from '../../components/primitives';
import { FinderModule } from '../module.Finder';
import { css, CssValue, ui, t } from './common';
import { ComponentFrame } from './ComponentFrame';
import { SampleModule } from '../module.Sample';

const { ModuleView } = ui;

/**
 * Component
 */
export type ITestProps = { style?: CssValue };
export type ITestState = {
  main?: t.MyModule;
};

export class Test extends React.PureComponent<ITestProps, ITestState> {
  public state: ITestState = {};
  private state$ = new Subject<Partial<ITestState>>();
  private unmounted$ = new Subject();

  public static contextType = ui.Context;
  public context!: t.IEnvContext;

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
    this.init();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * Sample module setup.
   */
  private async init() {
    const bus = this.bus;

    /**
     * Simulate a module registering itself.
     * NOTE:
     *   This would typically be through some other boot-up process where
     *   the module is pulled then spins itself up and registers itself.
     */
    const main = SampleModule.init(bus);
    FinderModule.init(bus);

    this.state$.next({ main });

    console.log('main:', main.id);
    console.log('-------------------------------------------');
  }

  /**
   * [Properties]
   */
  public get bus(): t.EventBus {
    return this.context.bus;
  }

  /**
   * [Render]
   */
  public render() {
    const MARGIN = 40;
    const styles = {
      base: css({
        Absolute: 0,
        display: 'flex',
        boxSizing: 'border-box',
        WebkitAppRegion: 'drag',
      }),
      body: css({
        flex: 1,
        Flex: 'horizontal-stretch-stretch',
        margin: MARGIN,
      }),
      tree: css({
        position: 'relative',
        width: 280,
        WebkitAppRegion: 'none',
        display: 'flex',
      }),
      main: css({
        position: 'relative',
        flex: 1,
        WebkitAppRegion: 'none',
      }),
      fill: css({ Absolute: 0 }),
      iconSettings: css({ Absolute: [8, null, null, 8] }),
    };

    const bg = 1;
    const bus = this.bus;

    return (
      <div {...css(styles.base, this.props.style)}>
        <Icons.Settings style={styles.iconSettings} size={18} />
        <div {...styles.body}>
          <div {...css(styles.tree, { marginRight: MARGIN })}>
            <ComponentFrame name={'ModuleView.Tree'} backgroundColor={bg}>
              <ModuleView.Tree
                module={this.state.main}
                strategy={this.treeStrategy}
                focusOnLoad={true}
                totalColumns={1}
              />
            </ComponentFrame>
          </div>
          <div {...styles.main}>
            <ComponentFrame name={'ModuleView.Frame'} backgroundColor={bg}>
              <ModuleView.Frame style={styles.fill} filter={this.mainViewFilter} bus={bus} />
            </ComponentFrame>
          </div>
          <div {...css(styles.tree, { marginLeft: MARGIN })}>
            <ComponentFrame name={'ModuleView.Tree'} backgroundColor={bg} blur={true}>
              <ModuleView.Tree module={this.state.main} />
            </ComponentFrame>
          </div>
        </div>
      </div>
    );
  }

  /**
   * [Handlers]
   */

  private mainViewFilter: t.ModuleFilterView = (e) => {
    return true;
  };

  private treeStrategy = (fire: t.FireEvent) => {
    // NB: Sample of passing in specific behavior strategy into the tree.
    return ModuleView.Tree.Strategy.default({ fire });
  };
}
