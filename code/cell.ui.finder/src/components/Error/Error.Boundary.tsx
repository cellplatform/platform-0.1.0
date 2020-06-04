import * as React from 'react';
import { Subject } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { onStateChanged, R, t, toErrorPayload, ui } from '../../common';
import { ErrorView } from '../Error';

export type IErrorBoundaryProps = {
  name: t.IFinderError['name'];
  children?: React.ReactNode;
};
export type IErrorBoundaryState = {};

/**
 * Catch render errors within the visual tree.
 * https://reactjs.org/docs/error-boundaries.html
 */
export class ErrorBoundary extends React.Component<IErrorBoundaryProps, IErrorBoundaryState> {
  public state: IErrorBoundaryState = {};
  private state$ = new Subject<Partial<IErrorBoundaryState>>();
  private unmounted$ = new Subject<{}>();

  public static contextType = ui.Context;
  public context!: t.IFinderContext;

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    const ctx = this.context;
    const changes = onStateChanged(ctx.event$, this.unmounted$);

    const name = this.props.name;
    changes
      .on('FINDER/error', 'FINDER/tree')
      .pipe(
        map((e) => e.to.error || {}),
        distinctUntilChanged((prev, next) => R.equals(prev[name], next[name])),
      )
      .subscribe(() => this.forceUpdate());
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // HACK: Calling `setState` supresses React warnings.
    //       This is OK as the changing error state is managed by the global state-tree (store).
    this.state$.next({});

    // Store error on state-tree.
    if (this.context) {
      const { name } = this.props;
      const payload = toErrorPayload({ name, error, errorInfo });
      this.context.fire({ type: 'FINDER/error', payload });
    }
  }

  /**
   * [Properties]
   */
  public get error() {
    const state = this.context?.getState();
    const error = state?.error || {};
    return error[this.props.name];
  }

  /**
   * [Render]
   */
  public render() {
    const err = this.error;
    return err ? <ErrorView error={err.error} component={err.component} /> : this.props.children;
  }
}
