import * as React from 'react';
import { Subject, merge } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { defaultValue, color, css, CssValue, t, Module, ui } from '../../common';
import { CropMarks } from './Host.Component.CropMarks';

type E = t.HarnessEvent;
type P = t.HarnessProps;

export type IHostComponentProps = {
  bus: t.EventBus;
  harness: t.HarnessModule;
  isDraggable?: boolean;
  style?: CssValue;
};
export type IHostComponentState = { host?: t.IDevHost };

export class HostComponent extends React.PureComponent<IHostComponentProps, IHostComponentState> {
  public state: IHostComponentState = {};
  private state$ = new Subject<Partial<IHostComponentState>>();
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
    return this.host.layout || {};
  }

  private get borderColor() {
    const border = defaultValue(this.layout.border, true);
    const value = border === true ? 0.3 : border === false ? 0 : border;
    return color.format(value);
  }

  private get cropMarks() {
    return defaultValue(this.layout.cropMarks, true);
  }

  private get cropMarksColor() {
    const cropMarks = this.cropMarks;
    const value = cropMarks === true ? 1 : cropMarks === false ? 0 : cropMarks;
    return color.format(value);
  }

  /**
   * [Render]
   */
  public render() {
    const layout = this.layout;
    const MAIN: t.HarnessTarget = 'Main';

    const styles = {
      base: css({
        position: 'relative',
        flex: 1,
        padding: 30,
        boxSizing: 'border-box',
      }),
      body: css({
        Absolute: 0,
        Flex: 'center-center',
      }),
      outer: css({
        position: 'relative',
        border: `solid 1px ${this.borderColor}`,
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
            {this.cropMarks !== false && (
              <CropMarks color={this.cropMarksColor} margin={6} size={20} />
            )}
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
