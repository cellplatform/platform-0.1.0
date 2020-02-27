import { TypeSystem } from '../TypeSystem';
import { testFetch } from '../TypeSystem/test';
import { ERROR, expect, fs, TYPE_DEFS, R, t } from './test';

describe.only('TypeClient', () => {
  const fetch = testFetch({ defs: TYPE_DEFS });

  describe('load', () => {
    it('"ns:foo"', async () => {
      const type = await TypeSystem.Type.load({ ns: 'ns:foo', fetch });
      expect(type.uri).to.eql('ns:foo');
      expect(type.ok).to.eql(true);
    });

    it('"foo" (without "ns:" prefix)', async () => {
      const type = await TypeSystem.Type.load({ ns: 'foo', fetch });
      expect(type.uri).to.eql('ns:foo');
      expect(type.ok).to.eql(true);
    });
  });

  describe('errors', () => {
    it('error: malformed URI', async () => {
      const type = await TypeSystem.Type.load({ ns: 'ns:not-valid', fetch });
      expect(type.ok).to.eql(false);
      expect(type.errors[0].message).to.include(`invalid "ns" identifier`);
      expect(type.errors[0].type).to.eql(ERROR.TYPE.DEF);
    });

    it('error: not a "ns" uri', async () => {
      const type = await TypeSystem.Type.load({ ns: 'cell:foo!A1', fetch });
      expect(type.ok).to.eql(false);
      expect(type.errors[0].message).to.include(`Must be "ns"`);
      expect(type.errors[0].type).to.eql(ERROR.TYPE.DEF);
    });

    it('error: failure while loading', async () => {
      const fetch = testFetch({
        defs: TYPE_DEFS,
        before: e => {
          throw new Error('Derp!');
        },
      });
      const type = await TypeSystem.Type.load({ ns: 'foo', fetch });
      expect(type.ok).to.eql(false);
      expect(type.errors[0].message).to.include(`Failed while loading type for`);
      expect(type.errors[0].message).to.include(`Derp!`);
      expect(type.errors[0].type).to.eql(ERROR.TYPE.DEF);
    });

    it('error: 404 type definition not found', async () => {
      const type = await TypeSystem.Type.load({ ns: 'foo.no.exist', fetch });
      expect(type.ok).to.eql(false);
      expect(type.errors[0].message).to.include(`does not exist`);
      expect(type.errors[0].type).to.eql(ERROR.TYPE.DEF_NOT_FOUND);
    });

    it('error: 404 type definition in column reference not found', async () => {
      const defs = R.clone(TYPE_DEFS);
      delete defs['ns:foo.color']; // NB: Referenced type ommited.

      const fetch = testFetch({ defs });
      const type = await TypeSystem.Type.load({ ns: 'foo', fetch });

      expect(type.ok).to.eql(false);
      expect(type.errors[0].message).to.include(`The referenced type in column 'C'`);
      expect(type.errors[0].message).to.include(`could not be read`);
      expect(type.errors[0].type).to.eql(ERROR.TYPE.REF);
    });

    it('error: circular-reference (ns.implements self)', async () => {
      const defs = R.clone(TYPE_DEFS);
      const ns = 'ns:foo';
      const t = defs[ns].ns.type;
      if (t) {
        t.implements = ns; // NB: Implement self.
      }
      const type = await TypeSystem.Type.load({ ns, fetch: testFetch({ defs }) });

      expect(type.ok).to.eql(false);
      expect(type.errors[0].message).to.include(`cannot implement itself (circular-ref)`);
      expect(type.errors[0].type).to.eql(ERROR.TYPE.CIRCULAR_REF);
    });

    it('error: circular-reference (column, self)', async () => {
      const defs = R.clone(TYPE_DEFS);
      const columns = defs['ns:foo'].columns || {};
      const ns = 'ns:foo';
      if (columns.C?.props?.prop) {
        columns.C.props.prop.type = `=${ns}`;
      }
      const type = await TypeSystem.Type.load({ ns, fetch: testFetch({ defs }) });

      expect(type.ok).to.eql(false);
      expect(type.errors[0].message).to.include(`The referenced type in column 'C'`);
      expect(type.errors[0].message).to.include(`contains a circular reference`);
      expect(type.errors[0].type).to.eql(ERROR.TYPE.CIRCULAR_REF);
    });

    it.skip('error: circular-reference (column, within ref)', async () => {
      const defs = R.clone(TYPE_DEFS);
    });
  });

  it.skip('primitive types (string, bool, number, null, object)', () => {}); // tslint:disable-line

  describe('types', () => {
    it('empty: (no types / no columns)', async () => {
      const test = async (defs: { [key: string]: t.ITypeDefPayload }, length: number) => {
        const fetch = testFetch({ defs });
        const type = await TypeSystem.Type.load({ ns: 'foo', fetch });
        expect(type.types.length).to.eql(length);
      };

      const defs1 = R.clone(TYPE_DEFS);
      const defs2 = R.clone(TYPE_DEFS);

      delete defs1['ns:foo'].columns;
      defs2['ns:foo'].columns = {};

      await test(TYPE_DEFS, 3);
      await test(defs1, 0);
      await test(defs2, 0);
    });

    it('n-level deep type refs', async () => {
      const fetch = testFetch({ defs: TYPE_DEFS });
      const type = await TypeSystem.Type.load({ ns: 'foo', fetch });
      const types = type.types;

      const A = types[0];
      const B = types[1];
      const C = types[2];

      expect(typeof A.type).to.eql('string');
      expect(typeof B.type).to.eql('string');
      expect(typeof C.type).to.eql('object'); // Deep type ref.

      if (typeof C.type === 'object') {
        expect(C.type.types.length).to.greaterThan(1);
      }
    });
  });

  describe('typescript', () => {
    it('all types with header (default)', async () => {
      const type = await TypeSystem.Type.load({ ns: 'foo', fetch });
      const res = type.typescript();

      expect(res).to.include('Generated by');
      expect(res).to.include('export declare type MyRow');
      expect(res).to.include('export declare type MyColor');
    });

    it('no header', async () => {
      const type = await TypeSystem.Type.load({ ns: 'foo', fetch });
      const res = type.typescript({ header: false });

      expect(res).to.not.include('Generated by');
      expect(res).to.include('export declare type MyRow');
      expect(res).to.include('export declare type MyColor');
    });
  });

  describe('typescript: save file (.d.ts)', () => {
    const fetch = testFetch({ defs: TYPE_DEFS });

    it('save for local tests', async () => {
      const type = await TypeSystem.Type.load({ ns: 'foo', fetch });
      await type.save(fs).typescript(fs.join(__dirname, '.d.ts'));
    });

    it('dir (filename inferred from type)', async () => {
      const type = await TypeSystem.Type.load({ ns: 'foo', fetch });
      const typescript = type.typescript();
      const dir = fs.resolve('tmp/d');
      const res = await type.save(fs).typescript(dir);

      expect(res.path.endsWith('/d/MyRow.d.ts')).to.eql(true);
      expect(res.data).to.eql(typescript);

      const file = await fs.readFile(fs.join(dir, 'MyRow.d.ts'));
      expect(file.toString()).to.eql(typescript);
    });

    it('filename (explicit)', async () => {
      const type = await TypeSystem.Type.load({ ns: 'foo', fetch });
      const typescript = type.typescript();
      const dir = fs.resolve('tmp/d');
      const res1 = await type.save(fs).typescript(dir, { filename: 'Foo.txt' }); // NB: ".d.ts" automatically added.
      const res2 = await type.save(fs).typescript(dir, { filename: 'Foo.d.ts' });

      expect(res1.path.endsWith('/d/Foo.txt.d.ts')).to.eql(true);
      expect(res2.path.endsWith('/d/Foo.d.ts')).to.eql(true);

      const file1 = await fs.readFile(fs.join(dir, 'Foo.txt.d.ts'));
      const file2 = await fs.readFile(fs.join(dir, 'Foo.d.ts'));

      expect(file1.toString()).to.eql(typescript);
      expect(file2.toString()).to.eql(typescript);
    });
  });
});
