import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { AppWindowModel, color, css, CssValue, StateObject, ui } from '../../common';
import { Log } from '../Debug.Log';
import { SheetInfo } from './SheetInfo';
import { SheetInputUri } from './SheetInputUri';
import * as t from './types';

export type ISheetProps = { style?: CssValue };

export class Sheet extends React.PureComponent<ISheetProps> {
  private store = StateObject.create<t.IDebugSheet, t.DebugSheetEvent>({ uri: '', error: {} });

  private unmounted$ = new Subject();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    // const changed$ = this.store.changed$.pipe(takeUntil(this.unmounted$));
    this.store.changed$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.forceUpdate());
    // changed$.pipe(filter((e) => e.action === 'sheet/load')).subscribe(this.load);

    this.store.changed('DEBUG/Sheet/load', this.unmounted$).subscribe(this.load);

    this.init();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  private async getAppData(rowIndex: number) {
    const ctx = this.context;
    const window = await AppWindowModel.load({ client: ctx.client, uri: ctx.env.def });
    const app = window.app;
    const cursor = await app.props.data.load();
    const row = await (await cursor.data()).row(rowIndex).load();
    return {
      cursor,
      row,
      async save() {
        return ctx.client.saveChanges(cursor.sheet, { fire: ctx.fire, wait: 10 });
      },
    };
  }

  public init = async () => {
    const { row } = await this.getAppData(0);

    const uri = row.props.tmp || '';

    this.store.change((m) => (m.uri = uri));
  };

  public load = async () => {
    const ctx = this.context;
    const uri = this.store.state.uri;

    console.log('load', uri);

    const sheet = await ctx.client.sheet(uri);

    this.store.change((m) => (m.sheet = sheet));

    // await time.wait(100);

    const data = await this.getAppData(0);
    data.row.props.tmp = sheet.uri.toString();
    await data.save();
  };

  /**
   * [Properties]
   */

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
      left: css({
        position: 'relative',
        flex: 1,
        display: 'flex',
      }),
      right: css({
        position: 'relative',
        flex: 1,
        display: 'flex',
        borderLeft: `solid 1px ${color.format(-0.1)}`,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.left}>{this.renderLeft()}</div>
        <div {...styles.right}>
          <Log event$={ctx.event$} style={{ flex: 1 }} />
        </div>
      </div>
    );
  }

  private renderLeft() {
    const styles = {
      base: css({
        flex: 1,
        boxSizing: 'border-box',
        PaddingY: 20,
        PaddingX: 40,
      }),
      info: css({
        marginTop: 20,
      }),
    };
    return (
      <div {...styles.base}>
        <SheetInputUri store={this.store} />
        <SheetInfo store={this.store} style={styles.info} />
      </div>
    );
  }
}
