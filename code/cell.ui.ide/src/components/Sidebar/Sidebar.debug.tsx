import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { coord, css, CssValue, onStateChanged, t, time, ui, Uri } from '../../common';
import { IPropListItem, PropList } from '../primitives';

export type ISidebarDebugProps = { style?: CssValue };
export type ISidebarDebugState = t.Object;

export class SidebarDebug extends React.PureComponent<ISidebarDebugProps, ISidebarDebugState> {
  public state: ISidebarDebugState = {};
  private state$ = new Subject<Partial<ISidebarDebugState>>();
  private unmounted$ = new Subject();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    const ctx = this.context;
    const changes = onStateChanged(ctx.bus.event$, this.unmounted$);

    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));

    changes
      .on('APP:IDE/uri', 'APP:IDE/types/data', 'APP:IDE/types/clear')
      .pipe()
      .subscribe((e) => {
        this.forceUpdate();
      });
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

  public get uri() {
    return this.store.uri;
  }

  public get uriKey() {
    const uri = this.uri;
    return uri.substring(uri.lastIndexOf(':') + 1);
  }

  public get rowIndex() {
    return coord.cell.toRowIndex(this.uriKey);
  }

  public get isLoaded() {
    return Boolean(this.store.uri);
  }

  public get isTypesLoaded() {
    return Boolean(this.store.typesystem);
  }

  /**
   * [Render]
   */
  public render() {
    const styles = { base: css({}) };
    return <div {...css(styles.base, this.props.style)}>{this.renderPropList()}</div>;
  }

  private renderPropList() {
    const key = `B${this.rowIndex + 1}`;
    const isTypesLoaded = this.isTypesLoaded;

    const items: IPropListItem[] = [
      {
        label: 'type definitions',
        value: 'unload',
        onClick: this.unloadTypeDefs,
        visible: isTypesLoaded,
      },
      {
        label: 'type definitions',
        value: 'load',
        onClick: this.loadTypeDefs,
        visible: !isTypesLoaded,
      },
      { label: 'api', value: `change title ("${key}")`, onClick: this.debugChangeTitle },
      { label: 'sample code', value: `insert`, onClick: this.loadSampleCode },
    ];

    return <PropList title={'Debug'} items={items} />;
  }

  /**
   * [Handlers]
   */

  private debugChangeTitle = async () => {
    const index = this.rowIndex;
    if (index < 0) {
      return;
    }

    const ctx = this.context;
    const client = ctx.client;
    const ns = Uri.toNs(this.uri).id;

    const sheet = await client.sheet<t.AppTypeIndex>(ns);
    const data = await sheet.data('AppWindow').load();
    const row = data.row(index);

    const firstLine = this.store.text.split('\n')[0].replace(/^\/\//, '').trim();
    row.props.title = firstLine ? `👋 ${firstLine}` : '';

    await time.delay(50);
    const changes = sheet.state.changes;
    ctx.bus.fire({
      type: 'IPC/sheet/changed',
      payload: { source: ctx.env.def, changes },
    });
  };

  private loadTypeDefs = () => {
    const uri = this.store.uri;
    this.context.bus.fire({ type: 'APP:IDE/types/pull', payload: { uri } });
  };

  private unloadTypeDefs = () => {
    this.context.bus.fire({ type: 'APP:IDE/types/clear', payload: {} });
  };

  private loadSampleCode = () => {
    this.context.bus.fire({ type: 'APP:IDE/text', payload: { text: SAMPLE } });
  };
}

const SAMPLE = `

const foo: number[] = [1,2,3]
foo.map(num => num + 1)

const app: AppWindow = {
  app: 'ns:foo',
  title: 'MyAppWindow',
  width: 200,
  height: 150,
  x: 0,
  y: 120,
  isVisible: true,
  argv: [],
}


`;
