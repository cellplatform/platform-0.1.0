import '@platform/polyfill';

import { Client } from '@platform/cell.client';
import { css, CssValue } from '@platform/react';
import { queryString } from '@platform/util.string';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { t } from '../common';
import { ISampleData, TestGrid } from '../components/Test.Grid';

const parseClient = (href: string) => {
  const query = queryString.toObject<{ def: string }>(href);
  const parts = (query.def || '').split('ns:');

  const host = (parts[0] || location.host).replace(/:$/, '');
  const ns = parts[1];

  const def = ns ? `ns:${ns}` : '';
  const client = def ? Client.create(host) : undefined;

  return { host, def, client, href, query };
};

const loadFromClient = async (client: t.IClient, ns: string): Promise<ISampleData> => {
  const res = await client.ns(ns).read({ data: true });
  const data = res.body.data as t.IGridData;
  const cells = data.cells || {};
  const columns = data.columns || {};
  const rows = data.rows || {};

  // HACK: boolean not rendering in cell yet
  Object.keys(cells).forEach(key => {
    const cell = cells[key];
    if (typeof cell?.value === 'boolean') {
      cell.value = cell.value.toString();
    }
  });

  return { ns, cells, columns, rows };
};

export type IPageProps = {};
export type IPageState = {
  data?: ISampleData;
};

export class Page extends React.PureComponent<IPageProps, IPageState> {
  public state: IPageState = {};
  private state$ = new Subject<Partial<IPageState>>();
  private unmounted$ = new Subject<{}>();

  private def: string;
  private client: t.IClient | undefined;

  private testGrid!: TestGrid;
  private testGridRef = (ref: TestGrid) => (this.testGrid = ref);

  /**
   * [Lifecycle]
   */

  constructor(props: IPageProps) {
    super(props);
    const { client, def } = parseClient(location.href);
    this.def = def;
    this.client = client;
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
    this.load();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Methods]
   */
  public async load() {
    const client = this.client;
    const def = this.def;
    const data = client && def ? await loadFromClient(client, def) : undefined;
    this.state$.next({ data });
    return data;
  }

  /**
   * [Render]
   */
  public render() {
    const { data } = this.state;
    if (this.def && !data) {
      return null;
    } else {
      return (
        <TestGrid
          ref={this.testGridRef}
          left={false}
          editorType={'default'}
          data={this.state.data}
          onRefresh={this.handleRefresh}
        />
      );
    }
  }

  /**
   * [Handlers]
   */
  private handleRefresh = async () => {
    const grid = this.testGrid?.grid;
    const data = await this.load();
    if (grid && data) {
      grid.changeCells(data.cells);
    }
  };
}

/**
 * Initialize 🎉
 */
const el = <Page />;
ReactDOM.render(el, document.getElementById('root'));
