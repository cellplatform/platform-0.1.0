import React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { t, rx } from '../common';
import { ErrorViewDefault } from './ErrorView.Default';

export type ErrorBoundaryProps = {
  Error?: React.FC<t.ErrorViewProps>;
  style?: t.CssValue;
};
export type ErrorBoundaryState = { error?: Error; info?: React.ErrorInfo };

/**
 * Error boundary for hosted content
 * https://reactjs.org/docs/error-boundaries.html
 *
 * NOTE:
 *    The [ErrorBoundary] mechanism requires the use of a react class.
 *
 */
export class ErrorBoundary extends React.PureComponent<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {};
  private state$ = new Subject<Partial<ErrorBoundaryState>>();
  private unmounted$ = new Subject<void>();

  /**
   * [Lifecycle]
   */
  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.state$.next({ error, info: errorInfo });
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
  }

  public componentWillUnmount() {
    rx.done(this.unmounted$);
  }

  /**
   * [Render]
   */
  public render() {
    const children = this.props.children;
    if (!children) return null;

    /**
     * Success.
     */
    if (!this.state.error) return children;

    /**
     * Error condition.
     */
    const Error = this.props.Error ?? ErrorViewDefault;
    const { error, info } = this.state;
    return <Error onClear={this.clearError} error={error} info={info} style={this.props.style} />;
  }

  /**
   * [Handlers]
   */

  private clearError = () => {
    this.state$.next({ error: undefined, info: undefined });
  };
}
