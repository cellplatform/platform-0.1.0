import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { rx, css, CssValue, t, Module } from '../common';

export type IModuleViewFrameProps = {
  bus: t.EventBus<any>;
  filter?: t.ModuleFilterView;
  style?: CssValue;
};
export type IModuleViewFrameState = { el?: JSX.Element | null };

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

    rx.payload<t.IModuleRenderedEvent>(event$, 'Module/rendered')
      .pipe(filter((e) => this.filter(e.module, e.view)))
      .subscribe(({ el }) => this.state$.next({ el }));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
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
    return <div {...css(styles.base, this.props.style)}>{this.state.el}</div>;
  }

  /**
   * [Helpers]
   */

  private filter = (module: string, view: string) => {
    const { filter } = this.props;
    if (!filter) {
      return true;
    } else {
      const { namespace, key } = Module.Identity.parse(module);
      return filter({ module, namespace, key, view });
    }
  };
}
