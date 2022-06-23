import { t, Test, expect } from '../../test';
import { RouteTable } from '.';

export default Test.describe('Route.Table', (e) => {
  e.it('create: no initial defs', () => {
    const table = RouteTable();
    expect(table.routes).to.eql([]);
    expect(table.kind).to.eql('RouteTable');
  });

  e.it('create: initial RouteTable defs', () => {
    const defs: t.RouteTableDefs = { '/': () => null };
    const table = RouteTable(defs);
    expect(table.routes.length).to.eql(1);
    expect(table.routes[0].pattern).to.eql('/');
  });

  e.describe('declare', (e) => {
    e.it('additive (on new instance)', () => {
      const defs1: t.RouteTableDefs = { '/': () => null };
      const defs2: t.RouteTableDefs = { '/:foo': () => null };

      const table1 = RouteTable(defs1);
      expect(table1.routes[0].pattern).to.eql('/');

      const table2 = table1.declare(defs2);
      expect(table1).to.not.equal(table2); // Different instance.
      expect(table1.routes.length).to.eql(1); // No change.

      expect(table2.routes.length).to.eql(2);
      expect(table2.routes[0].pattern).to.eql('/');
      expect(table2.routes[1].pattern).to.eql('/:foo');
    });

    e.it('throw: existing route', () => {
      const handler = () => null;
      const defs1: t.RouteTableDefs = { '/': handler, '/foo': handler };
      const defs2: t.RouteTableDefs = { '/': handler, '/foo': handler, '/:bar': handler };

      const fn = () => RouteTable(defs1).declare(defs2);
      expect(fn).to.throw(/already been declared: "\/", "\/foo"/);
    });
  });

  e.describe('match', (e) => {
    e.it('no match (undefined)', () => {
      const table = RouteTable({ '/': () => e });
      const res = table.match('/foo');
      expect(res).to.eql(undefined);
    });

    e.it('match: "/"', () => {
      const table = RouteTable({ '/': () => e });
      const res = table.match('/');
      expect(res?.index).to.eql(0);
      expect(res?.path).to.eql('/');
      expect(res?.pattern).to.eql('/');
      expect(res?.params).to.eql({});
    });

    e.it('match: "/user/:id"', () => {
      const table = RouteTable().declare({ '/user/:id': () => null });
      type T = { id: string };
      const res = table.match<T>('/user/123');
      expect(res?.params.id).to.eql('123');
    });

    e.it('match: "/path/(.*) - wildcard"', () => {
      const table = RouteTable({ '/path/(.*)': () => null });
      const res = table.match('/path/123/456');
      expect(res?.params).to.eql({ 0: '123/456' });
    });

    e.it('match: "/path/:foo* - zero or more"', () => {
      const table = RouteTable({ '/path/:foo*': () => null });
      const res1 = table.match('/path/123/456');
      const res2 = table.match('/path');
      const res3 = table.match('/path/');

      expect(res1?.params).to.eql({ foo: ['123', '456'] });
      expect(res2?.params).to.eql({});
      expect(res3?.params).to.eql({});
    });
  });
});
