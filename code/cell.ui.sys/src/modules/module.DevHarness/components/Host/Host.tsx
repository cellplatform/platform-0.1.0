import * as React from 'react';
import { Subject, merge } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { defaultValue, color, css, CssValue, t, Module, ui } from '../../common';
import { Cropmarks } from './Host.Cropmarks';

type E = t.HarnessEvent;
type P = t.HarnessProps;

export type IHostProps = IHostPropsOverride & {
  bus: t.EventBus;
  harness: t.HarnessModule;
  style?: CssValue;
};
export type IHostPropsOverride = {
  layout?: t.IDevHostLayout;
};

export type IHostState = { host?: t.IDevHost };

export class Host extends React.PureComponent<IHostProps, IHostState> {
  public state: IHostState = {};
  private state$ = new Subject<Partial<IHostState>>();
  private unmounted$ = new Subject();
  private bus = this.props.bus.type<E>();

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));

    const bus = this.bus;
    const harness = this.harness;
    const fire = Module.fire<P>(bus);

    const match: t.ModuleFilterEvent = (e) => true;
    const events = Module.events<P>(
      Module.filter(bus.event$, match),
      merge(harness.dispose$, this.unmounted$),
    );

    // If the hosted component is not returning an element, render the harness "404".
    events.changed$
      .pipe(
        filter((e) => e.change.to.id === harness.id),
        filter((e) => !this.host?.view.component),
      )
      .subscribe((e) => {
        fire.render({ module: harness, view: '404' });
      });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  private get harness() {
    return this.props.harness;
  }

  private get host() {
    return this.state.host || { view: {} };
  }

  private get layout() {
    // NB: The layout may be "injected" in explicity via the renderer
    //     when performing a known layout configuration. Prefer this
    //     when available over the host details held against the rendered
    //     node, which should not be avilable if the prop is set.
    return this.props.layout || this.state.host?.layout || {};
  }

  private get borderColor() {
    const border = defaultValue(this.layout.border, true);
    const value = border === true ? 0.3 : border === false ? 0 : border;
    return color.format(value);
  }

  private get cropmarks() {
    return defaultValue(this.layout.cropmarks, true);
  }

  private get cropmarksColor() {
    const cropmarks = this.cropmarks;
    const value = cropmarks === true ? 1 : cropmarks === false ? 0 : cropmarks;
    return color.format(value);
  }

  /**
   * [Render]
   */
  public render() {
    const MAIN: t.HarnessTarget = 'Main';
    const layout = this.layout;
    const abs = layout.position?.absolute;

    const styles = {
      base: css({
        position: 'relative',
        flex: 1,
        padding: 30,
        boxSizing: 'border-box',
      }),
      body: css({
        Absolute: 0,
        Flex: abs ? undefined : 'center-center',
      }),
      outer: css({
        position: abs ? undefined : 'relative',
        Absolute: abs ? [abs.top, abs.right, abs.bottom, abs.left] : undefined,
        border: `solid 1px ${this.borderColor}`,
        backgroundColor: color.format(layout.background),
      }),
      frame: css({
        width: layout.width,
        height: layout.height,
        WebkitAppRegion: 'none',
      }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.body}>
          <div {...styles.outer}>
            {this.renderCropmarks()}
            <ui.ModuleView.Frame
              style={styles.frame}
              bus={this.props.bus}
              filter={this.viewFilter}
              target={MAIN}
              debug={false}
              onBeforeRender={this.beforeRender}
            />
          </div>
        </div>
      </div>
    );
  }

  private renderCropmarks() {
    if (!this.cropmarks) {
      return null;
    }

    const size = 20;
    const margin = 6;
    const offset = size + margin;

    // Ensure the space surrounding an absolute positioning is not less than the cropmark offset.
    const abs = this.layout.position?.absolute;
    if (abs && Object.keys(abs).some((key) => abs[key] < offset)) {
      return null;
    }

    return <Cropmarks color={this.cropmarksColor} margin={margin} size={size} />;
  }

  /**
   * Handlers
   */
  private viewFilter: t.ModuleFilterView<t.HarnessView, t.HarnessTarget> = (e) => {
    // NB: Ignore the DevHarness module itself.
    //     We are looking for "dev" components hosted within the harness.
    return e.module !== this.harness.id;
  };

  /**
   * Before a component renders, capture the configruation
   * details stored about the component on it's module node.
   */
  private beforeRender = (e: t.IModuleRendered<any>) => {
    const module = this.harness.find((child) => child.id === e.module);
    const node = module?.query.find(
      (item) => item.node.props?.data?.host?.view.component === e.view,
    );
    const host = node?.props?.data?.host;
    this.state$.next({ host });
  };
}
