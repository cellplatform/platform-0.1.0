import React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { t, rx } from '../common';
import { ErrorViewDefault } from './ErrorView.Default';

export type ErrorBoundaryProps = {
  children?: React.ReactNode;
  renderError?: t.RenderBoundaryError;
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
    const { children, style } = this.props;
    if (!children) return null;

    /**
     * Success.
     */
    const { error, info } = this.state;
    if (!error) return children;

    /**
     * Error condition.
     */
    const onClear = this.clearError;
    const renderError = this.props.renderError ?? ErrorViewDefault.render;
    return renderError({ error, info, style, onClear });
  }

  /**
   * [Handlers]
   */

  private clearError = () => {
    this.state$.next({ error: undefined, info: undefined });
  };
}
