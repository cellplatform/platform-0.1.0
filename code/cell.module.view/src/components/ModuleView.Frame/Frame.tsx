import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { rx, css, CssValue, t } from '../../common';
import { Module } from '../../Module';
import { DebugHeader } from './Frame.DebugHeader';

export type IModuleViewFrameProps = {
  bus: t.EventBus<any>;
  filter?: t.ModuleFilterView<any, any>;
  target?: string; // Optional "view target" to apply as an additional filter before rendering.
  debug?: boolean;
  style?: CssValue;
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
        filter((e) => (this.target ? this.target === e.target : true)),
        filter((e) => this.filterOn(e.module, e.view, e.target)),
      )
      .subscribe((e) => {
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
  public get target() {
    return this.props.target;
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        display: 'flex',
        position: 'relative',
        boxSizing: 'border-box',
      }),
    };

    const { rendered } = this.state;
    const elDebug = rendered?.el && this.props.debug && <DebugHeader rendered={rendered} />;

    return (
      <div {...css(styles.base, this.props.style)}>
        {rendered?.el}
        {elDebug}
      </div>
    );
  }

  /**
   * [Helpers]
   */

  private filterOn = (module: string, view: string, target?: string) => {
    const { filter } = this.props;
    if (!filter) {
      return true;
    } else {
      const { namespace, key } = Module.Identity.parse(module);
      return filter({ module, namespace, key, view, target });
    }
  };
}
