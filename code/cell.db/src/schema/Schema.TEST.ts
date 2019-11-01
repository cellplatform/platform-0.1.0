import { expect, getTestDb } from '../test';
import { Schema } from '.';
import { model } from '../model';

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

    it('from URI', () => {
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

  describe('URI from model', () => {
    it('from ns', async () => {
      const db = await getTestDb({});
      const uri = 'ns:1234';
      const ns = await model.Ns.create({ db, uri }).ready;
      expect(Schema.uri.fromNs(ns)).to.eql(uri);
    });

    it('from cell', async () => {
      const db = await getTestDb({});
      const uri = 'cell:abcd!A1';
      const cell = await model.Cell.create({ db, uri }).ready;
      expect(Schema.uri.fromCell(cell)).to.eql(uri);
    });

    it('from row', async () => {
      const db = await getTestDb({});
      const uri = 'row:abcd!1';
      const row = await model.Row.create({ db, uri }).ready;
      expect(Schema.uri.fromRow(row)).to.eql(uri);
    });

    it('from column', async () => {
      const db = await getTestDb({});
      const uri = 'col:abcd!A';
      const column = await model.Column.create({ db, uri }).ready;
      expect(Schema.uri.fromColumn(column)).to.eql(uri);
    });
  });
});
