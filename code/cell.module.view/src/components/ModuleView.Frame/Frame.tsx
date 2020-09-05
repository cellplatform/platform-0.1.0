import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { rx, css, CssValue, t } from '../../common';
import { Module } from '../../Module';
import { DebugHeader } from './Frame.DebugHeader';

export type IModuleViewFrameProps = {
  bus: t.EventBus<any>;
  filter?: t.ModuleFilterView<any, any>;
  region?: string; // Optional "view region" to target to apply as an additional filter before rendering.
  debug?: string;
  style?: CssValue;
  onBeforeRender?: (e: t.IModuleRendered<any>) => void;
};
export type IModuleViewFrameState = { rendered?: t.IModuleRendered<any> };

export class ModuleViewFrame extends React.PureComponent<
  IModuleViewFrameProps,
  IModuleViewFrameState
> {
  public state: IModuleViewFrameState = {};
  private state$ = new Subject<Partial<IModuleViewFrameState>>();
  private unmounted$ = new Subject();

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
    const event$ = this.props.bus.event$.pipe(takeUntil(this.unmounted$));

    rx.payload<t.IModuleRenderedEvent>(event$, 'Module/ui/rendered')
      .pipe(
        filter((e) => (this.region ? this.region === e.region : true)),
        filter((e) => this.filterOn(e.module, e.view, e.region)),
      )
      .subscribe((e) => {
        const { onBeforeRender } = this.props;
        if (onBeforeRender) {
          onBeforeRender(e);
        }
        this.state$.next({ rendered: e });
      });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get region() {
    return this.props.region;
  }

  /**
   * [Render]
   */
  public render() {
    const { debug } = this.props;
    const { rendered } = this.state;

    const styles = {
      base: css({
        display: 'flex',
        position: 'relative',
        boxSizing: 'border-box',
      }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        {rendered?.el}
        {rendered?.el && debug && <DebugHeader text={debug} />}
      </div>
    );
  }

  /**
   * [Helpers]
   */

  private filterOn = (module: string, view: string, region?: string) => {
    const { filter } = this.props;
    if (!filter) {
      return true;
    } else {
      const { namespace, key } = Module.Identity.parse(module);
      return filter({ module, namespace, key, view, region });
    }
  };
}
