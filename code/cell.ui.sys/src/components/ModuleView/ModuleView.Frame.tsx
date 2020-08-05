import * as React from 'react';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, CssValue, t } from '../../common';

export type IModuleViewFrameProps = {
  event$: Observable<t.Event>;
  filter: t.ModuleFilter;
  style?: CssValue;
};
export type IModuleViewFrameState = t.Object;

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
  constructor(props: IModuleViewFrameProps) {
    super(props);
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));

    const event$ = this.props.event$.pipe(takeUntil(this.unmounted$));

    event$.subscribe((e) => {
      console.log('e', e);
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
        position: 'relative',
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div>ModuleViewFrame</div>
      </div>
    );
  }
}
