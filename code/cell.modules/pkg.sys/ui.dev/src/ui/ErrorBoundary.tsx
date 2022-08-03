import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, CssValue, t, COLORS } from '../common';
import { Button } from './Primitives';
import { Icons } from './Icons';

export type ErrorBoundaryProps = {
  children?: React.ReactNode;
  style?: CssValue;
};
export type ErrorBoundaryState = { error?: Error; errorInfo?: React.ErrorInfo };

/**
 * Error boundary for hosted content
 * https://reactjs.org/docs/error-boundaries.html
 *
 * NOTE:
 *    The [ErrorBoundary] mechanism requires the use of a react class.
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
    this.state$.next({ error, errorInfo });
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
    if (!this.state.error) return this.props.children;

    const styles = {
      base: css({
        Absolute: 0,
        Flex: 'center-center',
        boxSizing: 'border-box',
      }),
      body: css({
        position: 'relative',
        minWidth: 400,
        MarginX: 50,
        padding: 30,
        backgroundColor: COLORS.CLI.MAGENTA,
        color: COLORS.WHITE,
        borderRadius: 10,
        overflow: 'hidden',
      }),
      close: css({
        Absolute: [5, 8, null, null],
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.body}>
          {this.renderError()}
          <Button style={styles.close} onClick={this.clearError}>
            <Icons.Close color={COLORS.WHITE} />
          </Button>
        </div>
      </div>
    );
  }

  private renderError() {
    const { error, errorInfo } = this.state;
    const componentStack = errorInfo?.componentStack.replace(/^\n/, '');

    const styles = {
      pre: css({ fontSize: 12 }),
    };

    return (
      <pre {...styles.pre}>
        <div>{error?.message}</div>
        <div>{error?.stack}</div>
        {componentStack && (
          <div>
            componentStack
            <div>{componentStack}</div>
          </div>
        )}
      </pre>
    );
  }

  /**
   * [Handlers]
   */

  private clearError = () => {
    this.state$.next({ error: undefined, errorInfo: undefined });
  };
}
