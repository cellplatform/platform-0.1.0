import * as React from 'react';
import { Subject, merge } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { color, css, CssValue, t, Module, ui } from '../../common';

type E = t.HarnessEvent;
type P = t.HarnessProps;

export type IHostComponentProps = {
  bus: t.EventBus;
  harness: t.HarnessModule;
  style?: CssValue;
};
export type IHostComponentState = t.Object;

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
        filter((e) => !this.host?.view),
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
  public get harness() {
    return this.props.harness;
  }

  public get host() {
    return this.harness.root.props?.data?.host;
  }

  /**
   * [Render]
   */
  public render() {
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
      frame: css({
        border: `solid 1px ${color.format(1)}`,
        width: 500,
        height: 500,
        // Absolute: [50, 30, 30,],
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div>Host</div>
        <div {...styles.body}>
          <ui.ModuleView.Frame
            bus={this.props.bus}
            filter={this.viewFilter}
            style={styles.frame}
            debug={true}
          />
        </div>
      </div>
    );
  }

  /**
   * Handlers
   */

  private viewFilter: t.ModuleFilterView = (e) => {
    return true;
  };
}
