import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, css, CssValue, t, ui, AppWindowModel, time } from '../../common';
import { DebugLog } from '../Debug.Log';
import { Button } from '../primitives';

export type IDebugSheetProps = { style?: CssValue };
export type IDebugSheetState = t.Object;

export class DebugSheet extends React.PureComponent<IDebugSheetProps, IDebugSheetState> {
  public state: IDebugSheetState = {};
  private state$ = new Subject<Partial<IDebugSheetState>>();
  private unmounted$ = new Subject();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  public init = async () => {
    const ctx = this.context;
    const window = await AppWindowModel.load({ client: ctx.client, uri: ctx.env.def });

    console.log('w.toObject()', window.toObject());

    const app = window.app;

    console.log('app.toObject()', app.toObject());

    console.log('-------------------------------------------');
    const appData = await app.props.data.load();

    console.log('data', appData);

    // const row = data.

    const row = await (await appData.data()).row(0).load();

    // await row.load();

    console.log('row.toObject()', row.toObject());

    console.log('row.props.tmp', row.props.tmp);

    row.props.tmp = 'hello';

    console.log('row.props.tmp', row.props.tmp);

    await time.wait(10);

    const res = await ctx.client.saveChanges(appData.sheet, { fire: ctx.fire });

    console.log('res', res);
  };

  /**
   * [Render]
   */
  public render() {
    const ctx = this.context;
    const styles = {
      base: css({
        Absolute: 0,
        backgroundColor: color.format(1),

        boxSizing: 'border-box',
        Flex: 'horizontal-stretch-stretch',
      }),
      left: css({ flex: 1, padding: 20 }),
      right: css({
        flex: 1,
        display: 'flex',
        borderLeft: `solid 1px ${color.format(-0.1)}`,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.left}>{this.renderLeft()}</div>
        <div {...styles.right}>
          <DebugLog event$={ctx.event$} style={{ flex: 1 }} />
        </div>
      </div>
    );
  }

  private renderLeft() {
    const styles = {
      base: css({}),
    };
    return (
      <div {...styles.base}>
        <Button onClick={this.init}>init</Button>
      </div>
    );
  }

  /**
   * [Handlers]
   */
}
