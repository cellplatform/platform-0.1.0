import { expect, t } from '../test';
import { Schema } from '.';

describe('schema', () => {
  describe('namespace', () => {
    it('existing id', () => {
      const ns = Schema.ns('abc');
      expect(ns.id).to.eql('abc');
      expect(ns.uri).to.eql('ns:abc');
    });

    it('generated id', () => {
      const ns = Schema.ns();
      expect(ns.id.length).to.greaterThan(10);
      expect(ns.uri).to.eql(`ns:${ns.id}`);
    });

    it('has path', () => {
      const ns = Schema.ns('abc');
      expect(ns.path).to.eql('NS/abc');
    });

    it('from uri', () => {
      const ns = Schema.ns('ns:abc');
      expect(ns.id).to.eql('abc');
      expect(ns.path).to.eql('NS/abc');
      expect(ns.uri).to.eql('ns:abc');
    });
  });

  describe('cell', () => {
    it('cell:A1', () => {
      const ns = Schema.ns('abc');
      const res = ns.cell('A1');
      expect(res.id).to.eql('A1');
      expect(res.path).to.eql('NS/abc/CELL/A1');
      expect(res.uri).to.eql('cell:abc!A1');
    });
  });

  describe('col', () => {
    it('column:A', () => {
      const ns = Schema.ns('abc');
      const res = ns.column('A');
      expect(res.id).to.eql('A');
      expect(res.path).to.eql('NS/abc/COL/A');
      expect(res.uri).to.eql('col:abc!A');
    });
  });

  describe('row', () => {
    it('row:1', () => {
      const ns = Schema.ns('abc');
      const res = ns.row('1');
      expect(res.id).to.eql('1');
      expect(res.path).to.eql('NS/abc/ROW/1');
      expect(res.uri).to.eql('row:abc!1');
    });
  });

  describe('file', () => {
    it('abc.123', () => {
      const ns = Schema.ns('abc');
      const res = ns.file('123');
      expect(res.id).to.eql('123');
      expect(res.path).to.eql('NS/abc/FILE/123');
      expect(res.uri).to.eql('file:abc.123');
    });
  });

  describe('Schema.from', () => {
    it('ns', async () => {
      const uri = 'ns:abc';
      const path = Schema.ns(uri).path;

      const test = (input: string | t.IDbModelNs) => {
        const res = Schema.from.ns(input);
        expect(res.uri).to.eql(uri);
        expect(res.toString()).to.eql(uri);
        expect(res.parts.id).to.eql('abc');
        expect(res.path).to.eql(path);
      };
      test(uri);
      test(path);
      test({ path } as any);
    });

    it('cell', async () => {
      const ns = 'ns:abc';
      const uri = 'cell:abc!A1';
      const path = Schema.ns(ns).cell('A1').path;

      const test = (input: string | t.IDbModelCell) => {
        const res = Schema.from.cell(input);
        expect(res.uri).to.eql(uri);
        expect(res.toString()).to.eql(uri);
        expect(res.parts.id).to.eql('abc!A1');
        expect(res.path).to.eql(path);
      };
      test(uri);
      test(path);
      test({ path } as any);
    });

    it('row', async () => {
      const ns = 'ns:abc';
      const uri = 'row:abc!1';
      const path = Schema.ns(ns).row('1').path;

      const test = (input: string | t.IDbModelRow) => {
        const res = Schema.from.row(input);
        expect(res.uri).to.eql(uri);
        expect(res.toString()).to.eql(uri);
        expect(res.parts.id).to.eql('abc!1');
        expect(res.path).to.eql(path);
      };
      test(uri);
      test(path);
      test({ path } as any);
    });

    it('column', async () => {
      const ns = 'ns:abc';
      const uri = 'col:abc!A';
      const path = Schema.ns(ns).column('A').path;

      const test = (input: string | t.IDbModelColumn) => {
        const res = Schema.from.column(input);
        expect(res.uri).to.eql(uri);
        expect(res.toString()).to.eql(uri);
        expect(res.parts.id).to.eql('abc!A');
        expect(res.path).to.eql(path);
      };
      test(uri);
      test(path);
      test({ path } as any);
    });

    it('file', async () => {
      const ns = 'ns:abc';
      const uri = 'file:abc.123';
      const path = Schema.ns(ns).file('123').path;

      const test = (input: string | t.IDbModelFile) => {
        const res = Schema.from.file(input);
        expect(res.uri).to.eql(uri);
        expect(res.toString()).to.eql(uri);
        expect(res.parts.id).to.eql('abc.123');
        expect(res.parts.ns).to.eql('abc');
        expect(res.parts.file).to.eql('123');
        expect(res.path).to.eql(path);
      };
      test(path);
      test(uri);
      test({ path } as any);
    });
  });
});
