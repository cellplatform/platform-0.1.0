import * as React from 'react';
import { Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Spinner } from '@platform/ui.spinner';

import { color, css, COLORS, CssValue, onStateChanged, t, ui, value } from '../../common';

export type IViewProps = { style?: CssValue };
export type IViewState = { el?: React.ReactNode; isSpinning?: boolean };

export class View extends React.PureComponent<IViewProps, IViewState> {
  public state: IViewState = {};
  private state$ = new Subject<Partial<IViewState>>();
  private unmounted$ = new Subject<{}>();

  public static contextType = ui.Context;
  public context!: t.IFinderContext;

  /**
   * [Lifecycle]
   */
  constructor(props: IViewProps) {
    super(props);
  }

  public componentDidMount() {
    const ctx = this.context;
    const changes = onStateChanged(ctx, this.unmounted$);
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));

    /**
     * Redraw when seletion changed.
     */
    changes
      .on('FINDER/tree')
      .pipe(distinctUntilChanged((prev, next) => prev.to.tree.selected === next.to.tree.selected))
      .subscribe((e) => {
        type P = t.IFinderViewRequest;

        const render: P['render'] = (el) => {
          payload.isHandled = true;
          if (typeof el === 'function') {
            this.state$.next({ isSpinning: true });

            const promise = el() as Promise<React.ReactNode>;
            promise
              .then((el) => this.state$.next({ el }))
              .catch((err) => {
                // TODO 🐷 show error
              })
              .finally(() => this.state$.next({ isSpinning: false }));
          } else {
            this.state$.next({ el });
          }
        };

        const payload: P = { state: ctx.getState(), isHandled: false, render };
        ctx.dispatch({
          type: 'FINDER/view/req',
          payload,
        });
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
        flex: 1,
        display: 'flex',
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        {this.state.el}
        {this.renderSpinner()}
      </div>
    );
  }

  private renderSpinner() {
    if (!this.state.isSpinning) {
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
}
