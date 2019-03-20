import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, GlamorValue, t } from '../../../common';

import dg from '../../../../../node_modules/@platform/ui.datagrid';

export type IDbGridProps = { db: t.ITestRendererDb; style?: GlamorValue };
export type IDbGridState = {};

export class DbGrid extends React.PureComponent<IDbGridProps, IDbGridState> {
  public state: IDbGridState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<IDbGridState>>();
  private events$ = new Subject<dg.GridEvent>();

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Render]
   */
  public render() {
    console.log('dg', dg);

    const styles = {
      base: css({
        backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
        flex: 1,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div>DbGrid</div>
      </div>
    );
  }
}
