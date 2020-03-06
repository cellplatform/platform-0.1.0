import { ERROR, expect, fs, R, testFetch, TYPE_DEFS, t } from '../test';
import { TypeSystem } from '..';
import { TypeClient } from '.';

describe.only('TypeClient', () => {
  const fetch = testFetch({ defs: TYPE_DEFS });

  it('TypeSystem.Type === TypeClient', () => {
    expect(TypeSystem.Type).to.equal(TypeClient);
  });

  describe('load', () => {
    it('"ns:foo"', async () => {
      const def = await TypeClient.load({ ns: 'ns:foo', fetch });
      expect(def.uri).to.eql('ns:foo');
      expect(def.typename).to.eql('MyRow');
      expect(def.errors).to.eql([]);
      expect(def.columns.map(c => c.column)).to.eql(['A', 'B', 'C']);
    });

    it('"foo" (without "ns:" prefix)', async () => {
      const def = await TypeClient.load({ ns: 'foo', fetch });
      expect(def.uri).to.eql('ns:foo');
      expect(def.typename).to.eql('MyRow');
      expect(def.errors).to.eql([]);
      expect(def.columns.map(c => c.column)).to.eql(['A', 'B', 'C']);
    });
  });

  describe('errors', () => {
    it('error: malformed URI', async () => {
      const def = await TypeClient.load({ ns: 'ns:not-valid', fetch });
      expect(def.ok).to.eql(false);
      expect(def.errors.length).to.eql(1);
      expect(def.errors[0].message).to.include(`invalid "ns" identifier`);
      expect(def.errors[0].type).to.eql(ERROR.TYPE.DEF);
    });

    it('error: not a "ns" uri', async () => {
      const def = await TypeClient.load({ ns: 'cell:foo!A1', fetch });
      expect(def.ok).to.eql(false);
      expect(def.errors.length).to.eql(1);
      expect(def.errors[0].message).to.include(`Must be "ns"`);
      expect(def.errors[0].type).to.eql(ERROR.TYPE.DEF);
    });

    it('error: failure while loading', async () => {
      const fetch = testFetch({
        defs: TYPE_DEFS,
        before: e => {
          throw new Error('Derp!');
        },
      });
      const def = await TypeClient.load({ ns: 'foo', fetch });
      expect(def.ok).to.eql(false);
      expect(def.errors.length).to.eql(1);
      expect(def.errors[0].message).to.include(`Failed while loading type for`);
      expect(def.errors[0].message).to.include(`Derp!`);
      expect(def.errors[0].type).to.eql(ERROR.TYPE.DEF);
    });

    it('error: 404 type definition not found', async () => {
      const def = await TypeClient.load({ ns: 'foo.no.exist', fetch });
      expect(def.ok).to.eql(false);
      expect(def.errors.length).to.eql(1);
      expect(def.errors[0].message).to.include(`does not exist`);
      expect(def.errors[0].type).to.eql(ERROR.TYPE.DEF_NOT_FOUND);
    });

    it('error: 404 type definition in column reference not found', async () => {
      const defs = R.clone(TYPE_DEFS);
      delete defs['ns:foo.color']; // NB: Referenced type ommited.

      const fetch = testFetch({ defs });
      const def = await TypeClient.load({ ns: 'foo', fetch });

      expect(def.ok).to.eql(false);
      expect(def.errors.length).to.eql(1);

      expect(def.errors[0].message).to.include(`The referenced type in column 'C'`);
      expect(def.errors[0].message).to.include(`could not be read`);
      expect(def.errors[0].type).to.eql(ERROR.TYPE.REF);
    });

    it('error: circular-reference (ns.implements self)', async () => {
      const defs = R.clone(TYPE_DEFS);
      const ns = 'ns:foo';
      const t = defs[ns].ns.type;
      if (t) {
        t.implements = ns; // NB: Implement self.
      }
      const def = await TypeClient.load({ ns, fetch: testFetch({ defs }) });

      expect(def.ok).to.eql(false);
      expect(def.errors.length).to.eql(1);
      expect(def.errors[0].message).to.include(`cannot implement itself (circular-ref)`);
      expect(def.errors[0].type).to.eql(ERROR.TYPE.CIRCULAR_REF);
    });

    it('error: circular-reference (column, self)', async () => {
      const defs = R.clone(TYPE_DEFS);
      const columns = defs['ns:foo'].columns || {};
      const ns = 'ns:foo';
      if (columns.C?.props?.prop) {
        columns.C.props.prop.type = `${ns}`;
      }
      const def = await TypeClient.load({ ns, fetch: testFetch({ defs }) });

      expect(def.ok).to.eql(false);
      expect(def.errors.length).to.eql(1);
      expect(def.errors[0].message).to.include(`The referenced type in column 'C'`);
      expect(def.errors[0].message).to.include(`contains a circular reference`);
      expect(def.errors[0].type).to.eql(ERROR.TYPE.CIRCULAR_REF);
    });

    it('error: circular-reference (column, within ref)', async () => {
      const defs = {
        'ns:foo.one': {
          ns: { type: { typename: 'One' } },
          columns: {
            A: { props: { prop: { name: 'two', type: 'ns:foo.two' } } },
          },
        },
        'ns:foo.two': {
          ns: { type: { typename: 'Two' } },
          columns: {
            A: { props: { prop: { name: 'two', type: 'ns:foo.one' } } },
          },
        },
      };
      const ns = 'ns:foo.one';
      const def = await TypeClient.load({ ns, fetch: testFetch({ defs }) });

      expect(def.ok).to.eql(false);
      expect(def.errors.length).to.eql(1);
      expect(def.errors[0].type).to.eql(ERROR.TYPE.CIRCULAR_REF);
    });

    it('error: duplicate property names', async () => {
      const defs = {
        'ns:foo.error': {
          ns: { type: { typename: 'Foo' } },
          columns: {
            A: { props: { prop: { name: 'foo', type: 'string' } } },
            B: { props: { prop: { name: 'isEnabled', type: 'string' } } },
            C: { props: { prop: { name: 'foo', type: `'red'` } } },
            D: { props: { prop: { name: 'Foo', type: 'boolean' } } },
          },
        },
      };
      const def = await TypeClient.load({ ns: 'foo.error', fetch: testFetch({ defs }) });
      const error = def.errors[0];

      expect(def.errors.length).to.eql(1);
      expect(error.type).to.eql(ERROR.TYPE.PROP.DUPLICATE_NAME);
      expect(error.message).to.include(`The property name 'foo' is duplicated in columns [A,C]`);
    });

    it.skip('error: namespace typename invalid (eg "foo", ".foo", "foo-1")', async () => {
      /*
      foo
      Foo.1
      Foo-2
      .Foo
      1Foo

      */
    });
  });

  describe('types', () => {
    it('empty: (no types / no columns)', async () => {
      const test = async (defs: { [key: string]: t.ITypeDefPayload }, length: number) => {
        const fetch = testFetch({ defs });
        const res = await TypeClient.load({ ns: 'foo', fetch });
        expect(res.columns.length).to.eql(length);
      };

      const defs1 = R.clone(TYPE_DEFS);
      const defs2 = R.clone(TYPE_DEFS);

      delete defs1['ns:foo'].columns;
      defs2['ns:foo'].columns = {};

      await test(TYPE_DEFS, 3);
      await test(defs1, 0);
      await test(defs2, 0);
    });

    describe('VALUE (primitives)', () => {
      const test = async (column: string, typename: string) => {
        const fetch = testFetch({ defs: TYPE_DEFS });
        const def = await TypeClient.load({ ns: 'foo.primitives', fetch });
        const res = def.columns.find(c => c.column === column);
        expect(res).to.not.eql(undefined);
        if (res) {
          expect(res.type.kind).to.eql('VALUE');
          expect(res.type.typename).to.eql(typename);
        }
      };

      it('string', async () => {
        await test('A', 'string');
      });

      it('number', async () => {
        await test('B', 'number');
      });

      it('boolean', async () => {
        await test('C', 'boolean');
      });

      it('null', async () => {
        await test('D', 'null');
      });

      it('undefined', async () => {
        await test('E', 'undefined');
      });
    });

    describe('REF (object)', () => {
      it('REF object-type, n-level deep ("ns:xxx")', async () => {
        const fetch = testFetch({ defs: TYPE_DEFS });
        const def = await TypeClient.load({ ns: 'foo', fetch });

        const A = def.columns[0];
        const B = def.columns[1];
        const C = def.columns[2];

        expect(A.type.kind).to.eql('VALUE');
        expect(A.type.typename).to.eql('string');

        expect(B.type.kind).to.eql('VALUE');
        expect(B.type.typename).to.eql('boolean');

        expect(C.type.kind).to.eql('REF');
        expect(C.type.typename).to.eql('MyColor');

        if (C.type.kind === 'REF') {
          expect(C.type.kind).to.eql('REF');
          expect(C.type.uri).to.eql('ns:foo.color');
        }
      });

      it('REF optional property', async () => {
        const fetch = testFetch({ defs: TYPE_DEFS });
        const def = await TypeClient.load({ ns: 'foo', fetch });

        const A = def.columns[0];
        const B = def.columns[1];
        const C = def.columns[2];

        expect(A.prop).to.eql('title');
        expect(B.prop).to.eql('isEnabled');
        expect(C.prop).to.eql('color');

        expect(A.optional).to.eql(undefined);
        expect(B.optional).to.eql(undefined);
        expect(C.optional).to.eql(true);
      });

      it('REF array', async () => {
        const fetch = testFetch({ defs: TYPE_DEFS });
        const def = await TypeClient.load({ ns: 'foo.messages', fetch });

        expect(def.ok).to.eql(true);
        expect(def.errors).to.eql([]);

        const B = def.columns[1];
        const C = def.columns[2];

        expect(B.type.kind).to.eql('REF');
        if (B.type.kind === 'REF') {
          expect(B.type.uri).to.eql('ns:foo.color');
          expect(B.type.isArray).to.eql(undefined);
        }

        expect(C.type.kind).to.eql('REF');
        if (C.type.kind === 'REF') {
          expect(C.type.uri).to.eql('ns:foo.message'); // NB: Array suffix ("[]") removed from URI.
          expect(C.type.isArray).to.eql(true);
        }
      });
    });

    describe.only('REF(column) => <uri>', () => {
      const defs = {
        'ns:foo.1': {
          ns: { type: { typename: 'Foo1' } },
          columns: {
            A: { props: { prop: { name: 'myFoo', type: 'cell:foo.2!A' } } },
            B: { props: { prop: { name: 'myBar', type: 'cell:foo.2!B' } } },
            C: { props: { prop: { name: 'myObjectRef', type: 'cell:foo.2!C' } } },
            D: { props: { prop: { name: 'myColumnRef', type: 'cell:foo.2!D' } } },
          },
        },
        'ns:foo.2': {
          ns: { type: { typename: 'Foo2' } },
          columns: {
            A: { props: { prop: { name: 'foo', type: 'string' } } },
            B: { props: { prop: { name: 'bar', type: '"one" | "two" | "three"' } } },
            C: { props: { prop: { name: 'baz', type: 'ns:foo.3' } } },
            D: { props: { prop: { name: 'zoo', type: 'cell:foo.3!A' } } },
          },
        },
        'ns:foo.3': {
          ns: { type: { typename: 'Foo3' } },
          columns: {
            A: { props: { prop: { name: 'hello', type: 'number[] | boolean' } } },
          },
        },
      };

      it('REF(column) => VALUE (primitive)', async () => {
        const def = await TypeClient.load({ ns: 'foo.1', fetch: testFetch({ defs }) });
        expect(def.errors).to.eql([]);

        const A = def.columns[0];
        expect(A.column).to.eql('A');
        expect(A.prop).to.eql('myFoo');
        expect(A.type.kind).to.eql('VALUE');
        expect(A.type.typename).to.eql('string');
      });

      it('REF(column) => ENUM', async () => {
        const def = await TypeClient.load({ ns: 'foo.1', fetch: testFetch({ defs }) });
        expect(def.errors).to.eql([]);

        const B = def.columns[1];
        expect(B.column).to.eql('B');
        expect(B.prop).to.eql('myBar');
        expect(B.type.kind).to.eql('UNION');
        expect(B.type.typename).to.eql(`'one' | 'two' | 'three'`);
      });

      it('REF(column) => REF => object (ns)', async () => {
        const def = await TypeClient.load({ ns: 'foo.1', fetch: testFetch({ defs }) });
        expect(def.errors).to.eql([]);

        const C = def.columns[2];
        expect(C.column).to.eql('C');
        expect(C.prop).to.eql('myObjectRef');
        expect(C.type.kind).to.eql('REF');
        expect(C.type.typename).to.eql('Foo3');
        if (C.type.kind === 'REF') {
          expect(C.type.types[0].prop).to.eql('hello');
          expect(C.type.types[0].type.kind).to.eql('UNION');
          expect(C.type.types[0].type.typename).to.eql('number[] | boolean');
        }
      });

      it('REF(column) => REF(column) => VALUE (primitive)', async () => {
        const def = await TypeClient.load({ ns: 'foo.1', fetch: testFetch({ defs }) });
        expect(def.errors).to.eql([]);

        const D = def.columns[3];
        expect(D.column).to.eql('D');
        expect(D.prop).to.eql('myColumnRef');
        expect(D.type.kind).to.eql('UNION');
        expect(D.type.typename).to.eql('number[] | boolean');
        if (D.type.kind === 'UNION') {
          expect(D.type.types[0].typename).to.eql('number[]');
          expect(D.type.types[1].typename).to.eql('boolean');
        }
      });

      it.skip('REF(column) => REF (circular reference error)', async () => {
        //
      });
    });

    describe('ENUM', () => {
      it('ENUM (single)', async () => {
        const fetch = testFetch({ defs: TYPE_DEFS });
        const def = await TypeClient.load({ ns: 'foo.enum', fetch });
        const A = def.columns[0];
        expect(A.type.kind).to.eql('ENUM');
        expect(A.type.typename).to.eql(`'hello'`);
      });

      it('ENUM (union)', async () => {
        const fetch = testFetch({ defs: TYPE_DEFS });
        const def = await TypeClient.load({ ns: 'foo.enum', fetch });
        const B = def.columns[1];
        const type = B.type;

        expect(type.kind).to.eql('UNION');
        expect(type.typename).to.eql(`'red' | 'green' | 'blue'[]`);
        if (type.kind === 'UNION') {
          expect(type.types[0].kind).to.eql('ENUM');
          expect(type.types[0].typename).to.eql(`'red'`);

          expect(type.types[1].kind).to.eql('ENUM');
          expect(type.types[1].typename).to.eql(`'green'`);

          expect(type.types[2].kind).to.eql('ENUM');
          expect(type.types[2].typename).to.eql(`'blue'[]`);
          expect(type.types[2].isArray).to.eql(true);
        }
      });
    });
  });

  describe('cache', () => {
    it.skip('caches calls to the fetch methods', async () => {}); // tslint:disable-line
  });

  describe('typescript', () => {
    describe('declaration', () => {
      it('toString: with header (default)', async () => {
        const def = await TypeClient.load({ ns: 'foo', fetch });
        const res = TypeClient.typescript(def).toString();

        expect(res).to.include('Generated by');
        expect(res).to.include('"ns:foo"');
        expect(res).to.include('export declare type MyRow');
        expect(res).to.include('export declare type MyColor');
      });

      it('toString: no header', async () => {
        const def = await TypeClient.load({ ns: 'foo', fetch });
        const res = TypeClient.typescript(def, { header: false }).toString();

        expect(res).to.not.include('Generated by');
        expect(res).to.include('export declare type MyRow');
        expect(res).to.include('export declare type MyColor');
      });
    });

    describe('save file (.d.ts)', () => {
      const fetch = testFetch({ defs: TYPE_DEFS });

      it('save for local tests', async () => {
        const def = await TypeClient.load({ ns: 'foo', fetch });
        const ts = TypeClient.typescript(def);
        const dir = fs.join(__dirname, '../test/.d.ts');
        await ts.save(fs, dir);
      });

      it('dir (filename inferred from type)', async () => {
        const def = await TypeClient.load({ ns: 'foo', fetch });
        const ts = TypeClient.typescript(def);
        const dir = fs.resolve('tmp/d');
        const res = await ts.save(fs, dir);

        expect(res.path.endsWith('/d/MyRow.d.ts')).to.eql(true);
        expect(res.data).to.eql(ts.declaration); // NB: same as `ts.toString()`

        const file = await fs.readFile(fs.join(dir, 'MyRow.d.ts'));
        expect(file.toString()).to.eql(ts.toString()); // NB: same as `ts.declaration`
      });

      it('filename (explicit)', async () => {
        const def = await TypeClient.load({ ns: 'foo', fetch });
        const ts = TypeClient.typescript(def);

        const dir = fs.resolve('tmp/d');
        const res1 = await ts.save(fs, dir, { filename: 'Foo.txt' }); // NB: ".d.ts" automatically added.
        const res2 = await ts.save(fs, dir, { filename: 'Foo.d.ts' });

        expect(res1.path.endsWith('/d/Foo.txt.d.ts')).to.eql(true);
        expect(res2.path.endsWith('/d/Foo.d.ts')).to.eql(true);

        const file1 = await fs.readFile(fs.join(dir, 'Foo.txt.d.ts'));
        const file2 = await fs.readFile(fs.join(dir, 'Foo.d.ts'));

        expect(file1.toString()).to.eql(ts.toString());
        expect(file2.toString()).to.eql(ts.toString());
      });
    });
  });
});
