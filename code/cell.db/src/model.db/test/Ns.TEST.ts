import { Cell, Column, Ns, Row } from '..';
import { constants, expect, getTestDb, Schema, t } from '../../test';

type P = t.ICellProps;
type R = t.IRowProps & { grid: { height?: number } };
type C = t.IRowProps & { grid: { width?: number } };

describe('model.db.Ns (Namespace)', () => {
  it('creates (with child cells)', async () => {
    const db = await getTestDb({ file: true });
    const uri = 'ns:foo';
    const schema = Schema.ns(uri);

    await Cell.create({ db, uri: schema.cell('A1').uri.toString() })
      .set({ value: '123' })
      .save();

    await Cell.create({ db, uri: schema.cell('A2').uri.toString() })
      .set({ value: '456' })
      .save();

    const ns = Ns.create({ db, uri });
    expect((ns.props.props || {}).title).to.eql(undefined);
    expect(ns.props.hash).to.eql(undefined);

    const cells = (await ns.children.cells).map(c => c.toObject());
    expect(cells.length).to.eql(2);
    expect(cells[0].value).to.eql('123');
    expect(cells[1].value).to.eql('456');

    const rows = (await ns.children.rows).map(c => c.toObject());
    const cols = (await ns.children.columns).map(c => c.toObject());

    expect(rows).to.eql([]);
    expect(cols).to.eql([]);
  });

  it('stores props (name)', async () => {
    const db = await getTestDb({ file: true });
    const uri = 'ns:foo';

    const ns1 = await Ns.create({ db, uri }).ready;
    await ns1.set({ props: { title: 'My Namespace' } }).save();

    const ns2 = await Ns.create({ db, uri }).ready;
    expect((ns2.props.props || {}).title).to.eql('My Namespace');
  });

  describe('auto save (rules)', () => {
    it('stores id (auto)', async () => {
      const db = await getTestDb({ file: true });
      const uri = 'ns:foo';

      const ns1 = await Ns.create({ db, uri }).ready;
      expect(ns1.props.id).to.eql(undefined);

      await ns1.save(); // NB: the ID is auto-inserted on beforeSave handler.
      expect(ns1.props.id).to.eql('foo');

      const ns2 = await Ns.create({ db, uri }).ready;
      expect(ns2.props.id).to.eql('foo');
      expect(ns2.toObject().id).to.eql('foo');
    });

    it('updates hash on save (auto)', async () => {
      const db = await getTestDb({});
      const uri = 'ns:foo';

      // Save child data.
      // NB: hashes on child data auto-generated on save.
      const children = {
        A1: (await Cell.create<P>({ db, uri: 'cell:foo:A1' }).ready).set({ value: 123 }),
        A: (await Column.create<C>({ db, uri: 'cell:foo:A' }).ready).set({
          props: { grid: { width: 500 } },
        }),
        1: (await Row.create<R>({ db, uri: 'cell:foo:1' }).ready).set({
          props: { grid: { height: 30 } },
        }),
      };
      await children.A1.save();
      await children.A.save();
      await children['1'].save();

      // Test the namespace.
      const ns1 = await Ns.create({ db, uri }).ready;
      expect(ns1.props.hash).to.eql(undefined);

      await ns1.set({ props: { title: 'My Sheet' } }).save();
      expect(ns1.props.hash).to.not.eql(undefined);

      const ns2 = await Ns.create({ db, uri }).ready;
      expect(ns2.toObject().hash).to.eql(ns1.props.hash);

      // Force save the NS (causing the hash to update).
      await (async () => {
        const before = ns2.props.hash;
        expect(ns2.isChanged).to.eql(false);
        await ns2.save({ force: true });
        expect(ns2.props.hash).to.eql(before);
      })();

      // Change children.
      await (async () => {
        const { A1 } = children;
        const before = A1.props.hash;
        await A1.set({ value: 124 }).save();
        expect(A1.props.hash).to.not.eql(before); // A1 hash changed.
      })();

      // Force save the NS.
      // (NOTE: The hash of the containing namespace will not change,
      //        because none of its actual props are different).
      await (async () => {
        const before = ns2.props.hash;
        expect(ns2.isChanged).to.eql(false);
        await ns2.save({ force: true });
        expect(ns2.props.hash).to.eql(before); // NS hash NOT changed.
      })();
    });

    it('stores schema version (auto)', async () => {
      expect(constants.SCHEMA_VERSION).to.not.eql(undefined);

      const db = await getTestDb({});

      const ns1 = await Ns.create({ db, uri: 'ns:foo' }).ready;
      expect((ns1.props.props || {}).schema).to.eql(undefined);

      await ns1.set({ props: { title: 'My Sheet' } }).save();
      expect((ns1.props.props || {}).schema).to.eql(constants.SCHEMA_VERSION);

      // Auto saves version, when no changes.
      const ns2 = await Ns.create({ db, uri: 'ns:bar' }).ready;
      expect((ns2.props.props || {}).schema).to.eql(undefined);

      await ns2.save();
      expect((ns2.props.props || {}).schema).to.eql(constants.SCHEMA_VERSION);

      // Does not perform change if schema is up to date.
      const ns3 = await Ns.create({ db, uri: 'ns:zoo' }).ready;
      const changes1 = (await ns3.save()).changes;
      expect((ns3.props.props || {}).schema).to.eql(constants.SCHEMA_VERSION);
      const changes2 = (await ns3.save()).changes;

      expect(changes1.length).to.eql(2);
      expect(changes2.length).to.eql(0);
    });
  });
});
