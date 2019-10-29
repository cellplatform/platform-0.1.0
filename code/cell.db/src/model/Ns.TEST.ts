import { model } from '.';
import { Schema } from '../schema';
import { expect, getTestDb, R } from '../test';

describe('model.Ns (Namespace)', () => {
  it('creates (with child cells)', async () => {
    const db = await getTestDb({ file: true });

    const id = 'abc';
    const schema = Schema.ns(id);

    await db.put(schema.cell().path, { key: 'A1' });
    await db.put(schema.cell('456').path, { key: 'A2' });

    const ns = model.Ns.create({ db, id });

    expect(ns.props.name).to.eql(undefined);

    const cells = R.sortBy(R.prop('key'), (await ns.children.cells).map(c => c.toObject()));
    expect(cells.length).to.eql(2);
    expect(cells[0].key).to.eql('A1');
    expect(cells[1].key).to.eql('A2');

    const rows = R.sortBy(R.prop('key'), (await ns.children.rows).map(c => c.toObject()));
    const cols = R.sortBy(R.prop('key'), (await ns.children.columns).map(c => c.toObject()));

    expect(rows).to.eql([]);
    expect(cols).to.eql([]);
  });
});
