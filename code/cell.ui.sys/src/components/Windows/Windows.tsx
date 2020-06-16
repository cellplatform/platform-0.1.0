import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { coord, css, CssValue, rx, t, ui, Uri } from '../../common';
import { Card, IPropListItem, PropList } from '../primitives';

export type IWindowsProps = { uri: string; style?: CssValue };
export type IWindowsState = {
  name?: string;
  windows?: { uri: t.IRowUri; data: t.AppWindow }[];
};

export class Windows extends React.PureComponent<IWindowsProps, IWindowsState> {
  public state: IWindowsState = {};
  private state$ = new Subject<Partial<IWindowsState>>();
  private unmounted$ = new Subject<{}>();

  private ns: t.INsUri;
  private row: t.IRowUri;
  private index: number;

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */
  constructor(props: IWindowsProps) {
    super(props);
    this.ns = Uri.toNs(props.uri);
    this.row = Uri.row(props.uri);
    this.index = coord.cell.toRowIndex(this.row.key);
  }

  public componentDidMount() {
    const ctx = this.context;
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));

    this.load();
    rx.payload<t.ITypedSheetUpdatedEvent>(ctx.event$, 'SHEET/updated')
      .pipe() // TODO: narrow update filter.
      .subscribe((e) => {
        this.load();
      });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get windows() {
    return this.state.windows || [];
  }

  /**
   * [Methods]
   */
  public async load() {
    const ctx = this.context;
    const sheet = await ctx.client.sheet<t.App>(this.ns);
    const appData = await sheet.data('App').load();
    const row = appData.row(this.index);
    const windowsData = await row.props.windows.data();
    const windows = windowsData.rows.map((row) => ({ uri: row.uri, data: row.toObject() }));

    this.state$.next({ name: row.props.name, windows });
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        boxSizing: 'border-box',
        Flex: 'vertical-stretch-stretch',
        flex: 1,
      }),
      title: css({
        paddingTop: 15,
        paddingLeft: 22,
      }),
      body: css({
        Absolute: [45, 0, 0, 0],
        boxSizing: 'border-box',
        flex: 1,
        display: 'flex',
        alignContent: 'flex-start',
        flexWrap: 'wrap',
        paddingLeft: 10,
        paddingRight: 20,
        Scroll: true,
      }),
      empty: css({
        flex: 1,
        Flex: 'center-center',
        fontSize: 14,
        fontStyle: 'italic',
        opacity: 0.3,
      }),
    };

    const windows = this.windows;
    const isEmpty = windows.length === 0;

    const elWindows = windows.map((item, i) => {
      const { data, uri } = item;
      return <div key={i}>{this.renderWindow({ data, uri })}</div>;
    });

    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.title}>{this.state.name}</div>
        <div {...styles.body}>
          {elWindows}
          {isEmpty && (
            <div {...styles.empty}>
              <div>No windows currently open.</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  private renderWindow(args: { uri: t.IRowUri; data: t.AppWindow }) {
    const uri = args.uri.toString();
    const row = args.data;

    const styles = {
      base: css({
        padding: 20,
        minWidth: 280,
        marginLeft: 10,
        marginBottom: 10,
      }),
    };

    const host = this.context.client.http.origin;
    const { x, y, width, height, isVisible } = row;
    const position = x === undefined || y === undefined ? '-' : `x:${x} y:${y}`;
    const size = width === undefined || height === undefined ? '-' : `${width} x ${height}`;

    const items: IPropListItem[] = [
      { label: 'uri', value: uri, clipboard: `${host}/${uri}` },
      { label: 'position', value: position },
      { label: 'size', value: size },
      { label: 'visible', value: isVisible },
    ];

    return (
      <Card style={styles.base}>
        <PropList title={'Window'} items={items} />
      </Card>
    );
  }
}
