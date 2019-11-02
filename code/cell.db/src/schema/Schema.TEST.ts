import { expect, t, getTestDb } from '../test';
import { Schema } from '.';
import { model } from '..';

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

  describe('Schema.from', () => {
    it('ns', async () => {
      const db = await getTestDb({});
      const uri = 'ns:abc';
      const path = Schema.ns(uri).path;

      const test = (input: string | t.IModelNs) => {
        const res = Schema.from.ns(input);
        expect(res.uri).to.eql(uri);
        expect(res.toString()).to.eql(uri);
        expect(res.parts.id).to.eql('abc');
        expect(res.path).to.eql(path);
      };
      test(path);
      test(uri);
      test(await model.Ns.create({ db, uri }).ready);
    });

    it('cell', async () => {
      const db = await getTestDb({});
      const ns = 'ns:abc';
      const uri = 'cell:abc!A1';
      const path = Schema.ns(ns).cell('A1').path;

      const test = (input: string | t.IModelCell) => {
        const res = Schema.from.cell(input);
        expect(res.uri).to.eql(uri);
        expect(res.toString()).to.eql(uri);
        expect(res.parts.id).to.eql('abc!A1');
        expect(res.path).to.eql(path);
      };
      test(path);
      test(uri);
      test(await model.Cell.create({ db, uri }).ready);
    });

    it('row', async () => {
      const db = await getTestDb({});
      const ns = 'ns:abc';
      const uri = 'row:abc!1';
      const path = Schema.ns(ns).row('1').path;

      const test = (input: string | t.IModelRow) => {
        const res = Schema.from.row(input);
        expect(res.uri).to.eql(uri);
        expect(res.toString()).to.eql(uri);
        expect(res.parts.id).to.eql('abc!1');
        expect(res.path).to.eql(path);
      };
      test(path);
      test(uri);
      test(await model.Row.create({ db, uri }).ready);
    });

    it('column', async () => {
      const db = await getTestDb({});
      const ns = 'ns:abc';
      const uri = 'col:abc!A';
      const path = Schema.ns(ns).column('A').path;

      const test = (input: string | t.IModelColumn) => {
        const res = Schema.from.column(input);
        expect(res.uri).to.eql(uri);
        expect(res.toString()).to.eql(uri);
        expect(res.parts.id).to.eql('abc!A');
        expect(res.path).to.eql(path);
      };
      test(path);
      test(uri);
      test(await model.Column.create({ db, uri }).ready);
    });
  });
});
