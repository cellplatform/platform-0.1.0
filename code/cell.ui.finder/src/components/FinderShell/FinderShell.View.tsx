import { Spinner } from '@platform/ui.spinner';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, COLORS, css, CssValue, onStateChanged, t, ui } from '../../common';
import { ErrorView } from '../Error';

export type IFinderShellViewProps = { style?: CssValue };
export type IFinderShellViewState = {};

export class FinderShellView extends React.PureComponent<
  IFinderShellViewProps,
  IFinderShellViewState
> {
  public state: IFinderShellViewState = {};
  private state$ = new Subject<Partial<IFinderShellViewState>>();
  private unmounted$ = new Subject<{}>();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    const ctx = this.context;
    const changes = onStateChanged(ctx.event$, this.unmounted$);
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));

    /**
     * Redraw.
     */
    changes.on('APP:FINDER/view').subscribe(() => this.forceUpdate());
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get store() {
    return this.context.getState();
  }

  public get view() {
    return this.store.view;
  }

  public get isSpinning() {
    return this.view?.isSpinning || false;
  }

  public get el() {
    return this.view?.el || null;
  }

  public get error() {
    const error = this.context?.getState().error || {};
    return error?.view;
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        position: 'relative',
        display: 'flex',
        flex: 1,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        {this.el}
        {this.renderSpinner()}
        {this.renderError()}
      </div>
    );
  }

  private renderSpinner() {
    if (!this.isSpinning) {
      return null;
    }
    const styles = {
      base: css({
        Absolute: 0,
        Flex: 'center-center',
      }),
      container: css({
        backgroundColor: color.format(0.8),
        width: 120,
        height: 120,
        Flex: 'center-center',
        borderRadius: 8,
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.container}>
          <Spinner color={COLORS.DARK} />
        </div>
      </div>
    );
  }

  private renderError() {
    const err = this.error;
    return err ? <ErrorView error={err.error} component={err.component} /> : null;
  }
}
