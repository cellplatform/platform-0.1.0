import { model } from '.';
import { Schema } from '../schema';
import { expect, getTestDb, R } from '../test';

describe('model.Ns (Namespace)', () => {
  it('creates (with child cells)', async () => {
    const db = await getTestDb({ file: true });

    const uri = {
      ns: 'ns:abc',
    };
    const schema = Schema.ns(uri.ns);

    await model.Cell.create({ db, uri: schema.cell('A1').uri })
      .set({ value: '123' })
      .save();

    await model.Cell.create({ db, uri: schema.cell('A2').uri })
      .set({ value: '456' })
      .save();

    const ns = model.Ns.create({ db, uri: uri.ns });
    expect(ns.props.name).to.eql(undefined);

    const cells = (await ns.children.cells).map(c => c.toObject());
    expect(cells.length).to.eql(2);
    expect(cells[0].value).to.eql('123');
    expect(cells[1].value).to.eql('456');

    const rows = R.sortBy(R.prop('key'), (await ns.children.rows).map(c => c.toObject()));
    const cols = R.sortBy(R.prop('key'), (await ns.children.columns).map(c => c.toObject()));

    expect(rows).to.eql([]);
    expect(cols).to.eql([]);
  });
});
