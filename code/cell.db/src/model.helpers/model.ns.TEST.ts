import { t, expect, getTestDb } from '../test';
import { models } from '..';

describe('helpers: model.ns', () => {
  it('toSchema', async () => {
    const db = await getTestDb({});
    const test = (input: t.IDbModelNs | string) => {
      const res = models.ns.toSchema(input);
      expect(res.uri).to.eql('ns:foo');
      expect(res.path).to.eql('NS/foo');
      expect(res.parts.type).to.eql('ns');
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
    expect(res2.changes.map(c => c.field)).to.eql(['props', 'id', 'hash']);
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
});
