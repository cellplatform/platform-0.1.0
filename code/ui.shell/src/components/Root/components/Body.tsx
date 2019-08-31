import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

import { color, Context, css, t } from '../../common';

export type IBodyProps = {};
export type IBodyState = {};

export class Body extends React.PureComponent<IBodyProps, IBodyState> {
  public state: IBodyState = {};
  private state$ = new Subject<Partial<IBodyState>>();
  private unmounted$ = new Subject<{}>();

  public static contextType = Context;
  public context!: t.IShellContext;

  /**
   * [Lifecycle]
   */
  constructor(props: IBodyProps) {
    super(props);
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public componentDidMount() {
    this.model.changed$
      .pipe(
        takeUntil(this.unmounted$),
        debounceTime(0),
      )
      .subscribe(() => this.forceUpdate());
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get model() {
    return this.context.shell.state.body as t.IObservableProps<t.IShellBodyState>;
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Absolute: 0,
        backgroundColor: '#F8F9FA',
      }),
    };
    return <div {...styles.base}>{this.model.el}</div>;
  }
}
