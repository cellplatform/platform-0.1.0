import { t, expect, getTestDb, value } from '../test';
import { models } from '..';
import {
  getChildRows,
  setChildData,
  setChildCells,
  getChildCells,
  getChildColumns,
  getChildData,
  getChildFiles,
} from './model.ns';

type P = t.ICellProps;
type R = t.IRowProps & { grid: { height?: number } };
type C = t.IRowProps & { grid: { width?: number } };

const { deleteUndefined } = value;

describe('helpers: model.ns', () => {
  it('toSchema', async () => {
    const db = await getTestDb({});
    const test = (input: t.IDbModelNs | string) => {
      const res = models.ns.toSchema(input);
      expect(res.uri).to.eql('ns:foo');
      expect(res.path).to.eql('NS/foo');
      expect(res.parts.type).to.eql('NS');
      expect(res.parts.id).to.eql('foo');
    };
    test('ns:foo');
    test('NS/foo');
    test('foo');
    test(models.Ns.create({ uri: 'ns:foo', db }));
  });

  it('toId', async () => {
    const db = await getTestDb({});
    const test = (input: t.IDbModelNs | string) => {
      const res = models.ns.toId(input);
      expect(res).to.eql('foo');
    };
    test('ns:foo');
    test('NS/foo');
    test('foo');
    test(models.Ns.create({ uri: 'ns:foo', db }));
  });

  it('setProps', async () => {
    const db = await getTestDb({});
    const ns = models.Ns.create({ uri: 'ns:foo', db });
    expect(ns.props.hash).to.eql(undefined);

    const res1 = await models.ns.setProps({ ns }); // NB: no change.
    expect(res1.changes).to.eql([]);
    expect(ns.props.hash).to.eql(undefined);

    const res2 = await models.ns.setProps({ ns, data: { title: 'MySheet' } });
    const hash = ns.props.hash;
    expect(res2.changes.map(c => c.field)).to.eql(['props', 'id', 'props', 'hash']);
    expect(hash).to.not.eql(undefined);
    expect(ns.props.props && ns.props.props.title).to.eql('MySheet');

    const change = res2.changes[0];
    expect(change.uri).to.eql('ns:foo');
    expect(change.field).to.eql('props');
    expect(change.from).to.eql(undefined);
    expect(change.to).to.eql({ title: 'MySheet' });

    const res3 = await models.ns.setProps({ ns, data: { title: 'Foo' } });
    expect(res3.changes.map(c => c.field)).to.eql(['props', 'hash']);
    expect(ns.props.hash).to.not.eql(hash);
    expect(ns.props.props && ns.props.props.title).to.eql('Foo');

    const res4 = await models.ns.setProps({ ns, data: { title: undefined } });
    expect(res4.changes.map(c => c.field)).to.eql(['props', 'hash']);
    expect(ns.props.props && ns.props.props.title).to.eql(undefined);
  });

  describe('setChildData', () => {
    it('return change set (un-changed values not reported)', async () => {
      const db = await getTestDb({});
      const ns = models.Ns.create({ uri: 'ns:foo', db });

      const res1 = await setChildData({ ns, data: { cells: { A1: { value: '=A2' } } } });

      expect(res1.changes.length).to.eql(2);
      expect(res1.changes.map(c => c.field)).to.eql(['value', 'hash']);

      // NB: Change A1 "props", but "value" remains unchanged.
      const res2 = await setChildData({
        ns,
        data: { cells: { A1: { value: '=A2', props: { value: 'hello' } } } },
      });

      expect(res2.changes.length).to.eql(2); // NB: not 3, as the "value" field has not changed ("=A2").
      expect(res2.changes.map(c => c.field)).to.eql(['props', 'hash']);
    });

    it('sets error, then clear error', async () => {
      const error = { type: 'FOO', message: 'Boo' };
      const db = await getTestDb({});
      const ns = models.Ns.create({ uri: 'ns:foo', db });

      const getCells = async () => {
        await ns.load({ force: true });
        return getChildCells({ model: ns });
      };
      const getA1 = async () => ((await getCells()) || {}).A1 || {};

      expect(await getCells()).to.eql({});
      await setChildData({ ns, data: { cells: { A1: { value: 123 } } } });

      expect((await getA1()).value).to.eql(123);
      expect((await getA1()).error).to.eql(undefined);

      await setChildData({ ns, data: { cells: { A1: { error } } } });
      expect((await getA1()).value).to.eql(123);
      expect((await getA1()).error).to.eql(error);

      await setChildData({ ns, data: { cells: { A1: {} } } }); // NB: Error not removed because not explicitly set to [undefined].
      expect((await getA1()).value).to.eql(123);
      expect((await getA1()).error).to.eql(error);

      await setChildData({ ns, data: { cells: { A1: { error: undefined } } } });
      expect((await getA1()).value).to.eql(123);
      expect((await getA1()).error).to.eql(undefined); // NB: Error gone.
    });
  });

  describe('setChildCells', () => {
    it('sets error, then clear error', async () => {
      const error = { type: 'FOO', message: 'Boo' };
      const db = await getTestDb({});
      const ns = models.Ns.create({ uri: 'ns:foo', db });

      const getCells = async () => {
        await ns.load({ force: true });
        return getChildCells({ model: ns });
      };
      const getA1 = async () => ((await getCells()) || {}).A1 || {};

      expect(await getCells()).to.eql({});
      await setChildCells({ ns, data: { A1: { value: 123 } } });

      expect((await getA1()).value).to.eql(123);
      expect((await getA1()).error).to.eql(undefined);

      await setChildCells({ ns, data: { A1: { error } } });
      expect((await getA1()).value).to.eql(123);
      expect((await getA1()).error).to.eql(error);

      await setChildCells({ ns, data: { A1: { error: undefined } } });
      expect((await getA1()).value).to.eql(123);
      expect((await getA1()).error).to.eql(undefined); // NB: Error gone.
    });
  });

  describe('get (namespace child data)', () => {
    it('getChildCells (with links)', async () => {
      const db = await getTestDb({});
      const ns = models.Ns.create({ uri: 'ns:foo', db });

      const cell = models.Cell.create({ uri: 'cell:foo!A1', db });
      await cell.set({ value: 123, links: { 'fs:foo:wasm': 'file:abc.123' } }).save();

      const cells = await getChildCells({ model: ns });
      const A1 = cells.A1 || {};

      expect(A1.value).to.eql(123);
      expect(A1.links).to.eql({ 'fs:foo:wasm': 'file:abc.123' });
    });

    it('getChildRows', async () => {
      const db = await getTestDb({});
      const ns = models.Ns.create({ uri: 'ns:foo', db });

      const row = models.Row.create<R>({ uri: 'cell:foo!1', db });
      await row.set({ props: { grid: { height: 250 } } }).save();

      const rows = await getChildRows({ model: ns });
      expect(rows['1']).to.eql(deleteUndefined(row.toObject()));
    });

    it('getChildColumns', async () => {
      const db = await getTestDb({});
      const ns = models.Ns.create({ uri: 'ns:foo', db });

      const column = models.Column.create<C>({ uri: 'cell:foo!A', db });
      await column.set({ props: { grid: { width: 250 } } }).save();

      const columns = await getChildColumns({ model: ns });
      expect(columns.A).to.eql(deleteUndefined(column.toObject()));
    });

    it('getChildFiles', async () => {
      const db = await getTestDb({});
      const ns = models.Ns.create({ uri: 'ns:foo', db });

      const file = models.File.create({ uri: 'file:foo:abc', db });
      await file.set({ props: { mimetype: 'image/png' } }).save();

      const files = await getChildFiles({ model: ns });
      expect(files.abc).to.eql(deleteUndefined(file.toObject()));
    });

    it('getChildData', async () => {
      const db = await getTestDb({});
      const ns = models.Ns.create({ uri: 'ns:foo', db });

      const cell = models.Cell.create({ uri: 'cell:foo!A1', db });
      await cell.set({ value: 123, links: { 'fs:foo:wasm': 'file:abc.123' } }).save();

      const row = models.Row.create<R>({ uri: 'cell:foo!1', db });
      await row.set({ props: { grid: { height: 250 } } }).save();

      const column = models.Column.create<C>({ uri: 'cell:foo!A', db });
      await column.set({ props: { grid: { width: 250 } } }).save();

      const file = models.File.create({ uri: 'file:foo:abc', db });
      await file.set({ props: { mimetype: 'image/png' } }).save();

      const res1 = await getChildData({ model: ns });
      expect(res1).to.eql({});

      const res2 = await getChildData({ model: ns, cells: true });
      expect(res2).to.eql({
        cells: { A1: deleteUndefined(cell.toObject()) },
      });

      const res3 = await getChildData({
        model: ns,
        cells: true,
        rows: true,
        columns: true,
        files: true,
      });
      expect(res3).to.eql({
        cells: { A1: deleteUndefined(cell.toObject()) },
        rows: { '1': deleteUndefined(row.toObject()) },
        columns: { A: deleteUndefined(column.toObject()) },
        files: { abc: deleteUndefined(file.toObject()) },
      });
    });
  });
});
