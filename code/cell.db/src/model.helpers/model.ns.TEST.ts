import { t, expect, getTestDb } from '../test';
import { models } from '..';
import { setChildData, setChildCells, getChildCells } from './model.ns';

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

    const res2 = await models.ns.setProps({ ns, data: { name: 'MySheet' } });
    const hash = ns.props.hash;
    expect(res2.changes.map(c => c.field)).to.eql(['props', 'id', 'props', 'hash']);
    expect(hash).to.not.eql(undefined);
    expect(ns.props.props && ns.props.props.name).to.eql('MySheet');

    const change = res2.changes[0];
    expect(change.uri).to.eql('ns:foo');
    expect(change.field).to.eql('props');
    expect(change.from).to.eql(undefined);
    expect(change.to).to.eql({ name: 'MySheet' });

    const res3 = await models.ns.setProps({ ns, data: { name: 'Foo' } });
    expect(res3.changes.map(c => c.field)).to.eql(['props', 'hash']);
    expect(ns.props.hash).to.not.eql(hash);
    expect(ns.props.props && ns.props.props.name).to.eql('Foo');

    const res4 = await models.ns.setProps({ ns, data: { name: undefined } });
    expect(res4.changes.map(c => c.field)).to.eql(['props', 'hash']);
    expect(ns.props.props && ns.props.props.name).to.eql(undefined);
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

  describe('getChildCells', () => {
    it('gets child cells (with links)', async () => {
      const db = await getTestDb({});
      const ns = models.Ns.create({ uri: 'ns:foo', db });

      const cell = models.Cell.create({ uri: 'cell:foo!A1', db });
      await cell.set({ value: 123, links: { 'fs:foo:wasm': 'file:abc.123' } }).save();

      const cells = await getChildCells({ model: ns });
      const A1 = cells.A1 || {};

      expect(A1.value).to.eql(123);
      expect(A1.links).to.eql({ 'fs:foo:wasm': 'file:abc.123' });
    });
  });
});
