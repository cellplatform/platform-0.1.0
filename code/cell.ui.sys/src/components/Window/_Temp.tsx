import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

import { css, CssValue, t, ui, rx } from '../../common';
import { Button } from '../primitives';

export type ITempProps = { style?: CssValue };
export type ITempState = {
  width?: number;
};

export class Temp extends React.PureComponent<ITempProps, ITempState> {
  public state: ITempState = {};
  private state$ = new Subject<Partial<ITempState>>();
  private unmounted$ = new Subject<{}>();

  public static contextType = ui.Context;
  public context!: t.ISysContext;

  public sheet!: t.ITypedSheet<t.AppWindow>;
  public data!: t.ITypedSheetData<t.AppWindow>;

  /**
   * [Lifecycle]
   */
  constructor(props: ITempProps) {
    super(props);
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
    this.init();

    rx.payload<t.ITypedSheetUpdatedEvent>(this.context.event$, 'SHEET/updated')
      .pipe(debounceTime(5))
      .subscribe((e) => this.loadRow());
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * Methods
   */
  public async init() {
    const client = this.context.client;
    const sheet = await client.sheet<t.AppWindow>('ckbcxkwg4000wrpetgkfa79mn');
    const data = await sheet.data('AppWindow').load();
    this.sheet = sheet;
    this.data = data;
    this.loadRow();
  }

  public async loadRow() {
    const row = this.data.row(0);
    this.state$.next({ width: row.props.width });
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        marginTop: 50,
        backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
        minWidth: 500,
        pointerEvents: 'auto',
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div>width (C1): {this.state.width}</div>
        <Button onClick={this.handleClick}>click</Button>
      </div>
    );
  }

  private handleClick = async () => {
    this.loadRow();
  };
}
