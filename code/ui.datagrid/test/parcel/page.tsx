import '@platform/polyfill';

import { Client } from '@platform/cell.client';
import { queryString } from '@platform/util.string';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { t } from '../common';
import { ISampleData, TestGrid } from '../components/Test.Grid';

const parseClient = (href: string) => {
  const query = queryString.toObject<{ def: string }>(href);
  const parts = (query.def || '').split('ns:');

  const host = parts[0] || location.host;
  const ns = parts[1];

  const def = ns ? `ns:${ns}` : '';
  const client = def ? Client.create(host) : undefined;

  return { host, def, client, href, query };
};

const loadFromClient = async (client: t.IClient, ns: string): Promise<ISampleData> => {
  const res = await client.ns(ns).read({ data: true });
  const data = res.body.data;
  const cells = data.cells || {};
  const columns = data.columns || {};
  const rows = data.rows || {};

  // HACK: boolean not rendering in cell yet
  Object.keys(cells).forEach(key => {
    const cell = cells[key];
    if (typeof cell.value === 'boolean') {
      cell.value = cell.value.toString();
    }
  });

  return { ns, cells, columns, rows };
};

/**
 * Initialize 🎉
 */
(async () => {
  const { client, def } = parseClient(location.href);
  const data = client ? await loadFromClient(client, def) : undefined;
  const el = <TestGrid left={false} editorType={'default'} data={data} />;
  ReactDOM.render(el, document.getElementById('root'));
})();
