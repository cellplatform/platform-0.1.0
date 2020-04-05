import { Schema } from '.';
import { expect, t } from '../test';

describe('Schema', () => {
  describe('static', () => {
    it('hash', () => {
      const res = Schema.hash.sha256({ msg: 'abc' });
      expect(res).to.eql('sha256-88e2147d5ed37885f807e219fc43e5e32c150c83a121086b84b6ae43991ca7b7');
    });

    it('cuid', () => {
      const res = Schema.cuid();
      expect(res.length).to.greaterThan(20);
      expect(res[0]).to.eql('c');
    });

    it('slug', () => {
      const res = Schema.slug();
      expect(res.length).to.greaterThan(5);
      expect(res.length).to.lessThan(10);
    });
  });

  describe('namespace', () => {
    it('existing id', () => {
      const ns = Schema.ns('foo');
      expect(ns.id).to.eql('foo');
      expect(ns.uri).to.eql('ns:foo');
    });

    it('generated id', () => {
      const ns = Schema.ns(Schema.cuid());
      expect(ns.id.length).to.greaterThan(10);
      expect(ns.uri).to.eql(`ns:${ns.id}`);
    });

    it('has path', () => {
      const ns = Schema.ns('foo');
      expect(ns.path).to.eql('NS/foo');
    });

    it('from uri', () => {
      const ns = Schema.ns('ns:foo');
      expect(ns.id).to.eql('foo');
      expect(ns.path).to.eql('NS/foo');
      expect(ns.uri).to.eql('ns:foo');
    });
  });

  describe('cell', () => {
    it('cell:A1', () => {
      const ns = Schema.ns('foo');
      const res = ns.cell('A1');
      expect(res.id).to.eql('A1');
      expect(res.path).to.eql('NS/foo/CELL/A1');
      expect(res.uri.toString()).to.eql('cell:foo:A1');
    });
  });

  describe('column', () => {
    it('column:A', () => {
      const ns = Schema.ns('foo');
      const res = ns.column('A');
      expect(res.id).to.eql('A');
      expect(res.path).to.eql('NS/foo/COL/A');
      expect(res.uri.toString()).to.eql('cell:foo:A');
    });
  });

  describe('row', () => {
    it('row:1', () => {
      const ns = Schema.ns('foo');
      const res = ns.row('1');
      expect(res.id).to.eql('1');
      expect(res.path).to.eql('NS/foo/ROW/1');
      expect(res.uri.toString()).to.eql('cell:foo:1');
    });
  });

  describe('file', () => {
    it('foo:123', () => {
      const ns = Schema.ns('foo');
      const res = ns.file('123');
      expect(res.fileid).to.eql('123');
      expect(res.path).to.eql('NS/foo/FILE/123');
      expect(res.uri).to.eql('file:foo:123');
    });
  });

  describe('Schema.from', () => {
    it('ns', () => {
      const uri = 'ns:foo';
      const path = Schema.ns(uri).path;

      const test = (input: string | t.IDbModelNs) => {
        const res = Schema.from.ns(input);
        expect(res.uri).to.eql(uri);
        expect(res.toString()).to.eql(uri);
        expect(res.parts.id).to.eql('foo');
        expect(res.path).to.eql(path);
      };
      test(uri);
      test(path);
      test({ path } as any);
    });

    it('cell', () => {
      const ns = 'ns:foo';
      const uri = 'cell:foo:A1';
      const path = Schema.ns(ns).cell('A1').path;

      const test = (input: string | t.IDbModelCell) => {
        const res = Schema.from.cell(input);
        expect(res.uri).to.eql(uri);
        expect(res.toString()).to.eql(uri);
        expect(res.parts.id).to.eql('foo:A1');
        expect(res.path).to.eql(path);
      };
      test(uri);
      test(path);
      test({ path } as any);
    });

    it('cell (row)', () => {
      const ns = 'ns:foo';
      const uri = 'cell:foo:1';
      const path = Schema.ns(ns).row('1').path;

      const test = (input: string | t.IDbModelRow) => {
        const res = Schema.from.row(input);
        expect(res.uri).to.eql(uri);
        expect(res.toString()).to.eql(uri);
        expect(res.parts.id).to.eql('foo:1');
        expect(res.path).to.eql(path);
      };
      test(uri);
      test(path);
      test({ path } as any);
    });

    it('cell (column)', () => {
      const ns = 'ns:foo';
      const uri = 'cell:foo:A';
      const path = Schema.ns(ns).column('A').path;

      const test = (input: string | t.IDbModelColumn) => {
        const res = Schema.from.column(input);
        expect(res.uri).to.eql(uri);
        expect(res.toString()).to.eql(uri);
        expect(res.parts.id).to.eql('foo:A');
        expect(res.path).to.eql(path);
      };
      test(uri);
      test(path);
      test({ path } as any);
    });

    it('file', () => {
      const ns = 'ns:foo';
      const uri = 'file:foo:123';
      const path = Schema.ns(ns).file('123').path;

      const test = (input: string | t.IDbModelFile) => {
        const res = Schema.from.file(input);
        expect(res.uri).to.eql(uri);
        expect(res.toString()).to.eql(uri);
        expect(res.parts.id).to.eql('foo:123');
        expect(res.parts.ns).to.eql('foo');
        expect(res.parts.file).to.eql('123');
        expect(res.path).to.eql(path);
      };
      test(path);
      test(uri);
      test({ path } as any);
    });
  });
});
