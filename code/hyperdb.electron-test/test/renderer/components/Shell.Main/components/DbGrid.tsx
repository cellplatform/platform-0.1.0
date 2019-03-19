import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, GlamorValue, t } from '../../../common';

import * as datagrid from '@platform/ui.datagrid';

export type IDbGridProps = { db: t.ITestRendererDb; style?: GlamorValue };
export type IDbGridState = {};

export class DbGrid extends React.PureComponent<IDbGridProps, IDbGridState> {
  public state: IDbGridState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<IDbGridState>>();

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
