import { Cell } from '..';
import { expect, getTestDb, util } from '../../test';

describe('model.Cell', () => {
  it('saves', async () => {
    const db = await getTestDb({});
    const uri = 'cell:abcd!A1';

    const res1 = await Cell.create({ db, uri }).ready;
    expect(res1.props.value).to.eql(undefined);
    expect(res1.props.props).to.eql(undefined);
    expect(res1.props.links).to.eql(undefined);
    expect(res1.props.error).to.eql(undefined);
    expect(res1.props.hash).to.eql(undefined);

    const hash = 'sha256-abc123';
    const value = '=A2';
    const error = { type: 'FAIL', message: 'Boo' };
    const links = { main: 'ns:foo' };
    const props = { style: { bold: true } };
    await res1.set({ value, props, links, error, hash }).save();

    const res2 = await Cell.create({ db, uri }).ready;
    expect(res2.props.value).to.eql(value);
    expect(res2.props.props).to.eql(props);
    expect(res2.props.links).to.eql(links);
    expect(res2.props.error).to.eql(error);
    expect(res2.props.hash).to.eql(hash);
  });

  it('updates DB namespace doc-links before saving', async () => {
    const db = await getTestDb({});
    const uri = 'cell:abcd!A1';

    const model1 = await Cell.create({ db, uri }).ready;
    await model1.set({ value: '=A2' }).save(); // NB: `beforeSave` links routine not triggered.

    // Assign some links:
    model1.set({
      links: (
        util.cellData(model1.toObject()).mergeLinks({
          foo: 'ns:foo',
          bar: 'ns:bar',
          baz: 'data:random', // NB: not recognized, so not stored as namespace link.
        }) || {}
      ).links,
    });
    expect(model1.isChanged).to.eql(true);
    await model1.save();

    expect(model1.doc.nsRefs).to.eql(['NS/bar', 'NS/foo']); // Added by rule.

    // Assign and remove links.
    model1.set({
      links: (
        util.cellData(model1.toObject()).mergeLinks({
          foo: 'ns:foobar', //  Changed.
          bar: undefined, //    Removed.
          zoo: 'ns:zoo', //     Added.
        }) || {}
      ).links,
    });
    await model1.save();

    // Reload.
    const model2 = await Cell.create({ db, uri }).ready;
    expect(model2.doc.nsRefs).to.eql(['NS/foobar', 'NS/zoo']);
  });
});
