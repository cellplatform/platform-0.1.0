import * as React from 'react';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, CssValue, t } from '../../common';

import { Module } from '../../state.Module';

export type IModuleViewFrameProps = {
  event$: Observable<t.Event>;
  filter: t.ModuleFilter;
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
    const events = Module.events(this.props.event$, this.unmounted$).filter(this.props.filter);

    events.rendered$.subscribe((e) => {
      console.log('erendered:', e);
      const el = e.el;
      this.state$.next({ el });
    });
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
}
