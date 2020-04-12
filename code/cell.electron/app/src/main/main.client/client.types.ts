import '../config';
import { t, Client, fs, Schema, Uri, coord } from '../common';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import {
  takeUntil,
  take,
  takeWhile,
  map,
  filter,
  share,
  delay,
  distinctUntilChanged,
  debounceTime,
} from 'rxjs/operators';

type TypeDefs = { [key: string]: t.ITypeDefPayload };

const NS = {
  TYPE: {
    APP: 'ns:sys.app.type',
    WINDOW: 'ns:sys.window.type',
  },
  APP: 'ns:sys.app',
};

const DEFS: TypeDefs = {
  [NS.TYPE.APP]: {
    ns: { type: { typename: 'CellApp' } },
    columns: {
      A: { props: { prop: { name: 'title', type: 'string', default: 'CellOS' } } },
      B: { props: { prop: { name: 'windows', type: 'ns:sys.window.type[]', target: 'ref' } } },
    },
  },
  [NS.TYPE.WINDOW]: {
    ns: { type: { typename: 'CellAppWindow' } },
    columns: {
      A: { props: { prop: { name: 'title', type: 'string' } } },
    },
  },
};

/**
 * Write the application types.
 */
export async function writeTypeDefs(host: string, options: { save?: boolean } = {}) {
  const client = Client.http(host);

  const write = async (ns: string) => {
    if (!DEFS[ns]) {
      throw new Error(`namespace "${ns}" is not defined.`);
    }
    const res = await client.ns(ns).write(DEFS[ns]);
  };

  await write(NS.TYPE.APP);
  await write(NS.TYPE.WINDOW);

  if (options.save) {
    const type = Client.type({ client });
    const ts = await type.typescript(NS.TYPE.APP);
    await ts.save(fs, fs.resolve('src/types.d.ts'));
  }
}

/**
 * Writes (initializes) system data.
 */
export async function writeSys(host: string) {
  const client = Client.http(host);
  const ns = client.ns(NS.APP);
  if (!(await ns.exists())) {
    await ns.write({ ns: { type: { implements: NS.TYPE.APP } } });
  }

  const type = Client.type({ client });
  const sheet = await type.sheet<t.CellApp>(NS.APP);
  const app = sheet.cursor().row(0);

  // rx.debounceBuffer(sheet.state.changed$, 100).subscribe(e => {
  //   console.log('e', e);
  // });

  /**
   * TODO 🐷
   * - move this to [TypeSystem] as write syncer.
   */

  sheet.state.changed$.pipe(debounceTime(300)).subscribe(async e => {
    // console.log('CHANGE: ', sheet.state.changes);

    const changes = sheet.state.changes;
    const cells: t.ICellMap = {};
    Object.keys(changes)
      .filter(key => coord.cell.isCell(key))
      .forEach(key => (cells[key] = changes[key].to));

    console.log('-------------------------------------------');
    console.log('cells', cells);
    const res = await ns.write({ cells });
    console.log('-------------------------------------------');
    console.log('res', res);
    // TODO 🐷 - reset changes on state.
  });

  await app.ready();

  console.log('-------------------------------------------');
  console.log('sheet.uri', sheet.uri.toString());

  // console.log('row.toObject()', row.toObject());
  // const items: t.CellApp = { title: 'Foo', windows: [] };

  const windows = await app.props.windows.ready();

  console.log('app.status', app.status);
  console.log('title', app.props.title);

  // app.props.title = 'hello';
  // app.props.title = 'CellOS';

  console.log('-------------------------------------------');

  console.log('sheet.state.changes', sheet.state.changes);
  console.log('errors', sheet.errors);
  console.log('-------------------------------------------');
  console.log('title', app.props.title);
}
