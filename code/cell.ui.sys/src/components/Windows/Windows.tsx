import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

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
      .pipe(debounceTime(200)) // TODO: narrow update filter.
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
    const sheet = await ctx.client.sheet<t.AppTypeIndex>(this.ns);
    const apps = await sheet.data('App').load();

    const row = apps.row(this.index);
    const data = await row.props.windows.data();
    const windows = data.rows.map((row) => ({ uri: row.uri, data: row.toObject() }));

    const name = row.props.name;
    this.state$.next({ name, windows });

    await this.tmp(data.uri.id);
  }

  private async tmp(uri: string) {
    console.group('🌳 ');

    const ctx = this.context;
    const sheet = await ctx.client.sheet<t.AppTypeIndex>(this.ns);
    const apps = await sheet.data('App').load();

    for (const app of apps.rows) {
      const windows = await app.props.windows.data();
      for (const window of windows.rows) {
        console.log('----------', window.toObject());
        // await createBrowserWindow({ ctx, app, window });
      }
    }

    // console.log('uri', uri);

    // const ctx = this.context;
    // const sheet = await ctx.client.sheet<t.AppTypeIndex>(uri);
    // const d = await sheet.data('AppWindow').load();

    // d.forEach((f) => {
    //   console.log('-------------------------------------------');
    //   console.log('f', f.app);
    //   // console.log("f", f.)
    // });

    console.groupEnd();
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
        display: 'flex',
      }),
      empty: css({
        flex: 1,
        Flex: 'center-center',
        fontSize: 14,
        fontStyle: 'italic',
        opacity: 0.3,
      }),
    };

    const isEmpty = this.windows.length === 0;
    const elEmpty = isEmpty && (
      <div {...styles.empty}>
        <div>No windows currently open.</div>
      </div>
    );

    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.title}>{this.state.name}</div>
        <div {...styles.body}>
          {this.renderWindows()}
          {elEmpty}
        </div>
      </div>
    );
  }

  private renderWindows() {
    const windows = this.windows;
    if (windows.length === 0) {
      return null;
    }

    const styles = {
      base: css({
        display: 'flex',
        boxSizing: 'border-box',
        alignContent: 'flex-start',
        flexWrap: 'wrap',
        paddingLeft: 10,
        paddingRight: 20,
        Scroll: true,
      }),
    };

    const elWindows = this.windows.map((item, i) => {
      const { data, uri } = item;
      return <div key={i}>{this.renderWindow({ data, uri })}</div>;
    });

    return <div {...styles.base}>{elWindows}</div>;
  }

  private renderWindow(args: { uri: t.IRowUri; data: t.AppWindow }) {
    const uri = args.uri.toString();
    const row = args.data;

    const styles = {
      base: css({
        padding: 20,
        paddingTop: 15,
        minWidth: 280,
        marginLeft: 10,
        marginBottom: 10,
      }),
    };

    const host = this.context.client.http.origin;
    const { x, y, width, height, isVisible } = row;
    const position = x === undefined || y === undefined ? '-' : `${x} x ${y}`;
    const size = width === undefined || height === undefined ? '-' : `${width} x ${height}`;
    const argv = row.argv.join(',') || '—';

    const items: IPropListItem[] = [
      { label: 'uri', value: uri, clipboard: `${host}/${uri}` },
      { label: 'position', value: position },
      { label: 'size', value: size },
      { label: 'visible', value: isVisible },
      { label: 'argv', value: argv },
    ];

    return (
      <Card style={styles.base}>
        <PropList title={'Window'} items={items} />
      </Card>
    );
  }
}
