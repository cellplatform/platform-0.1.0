import { TypeClient } from '.';
import { TypeSystem } from '..';
import { Cache, ERROR, expect, fs, testFetch, TYPE_DEFS, Uri } from '../test';

describe('TypeClient', () => {
  const fetch = testFetch({ defs: TYPE_DEFS });

  it('TypeSystem.Type === TypeClient', () => {
    expect(TypeSystem.Type).to.equal(TypeClient);
  });

  describe('load', () => {
    it('"ns:foo"', async () => {
      const def = await TypeClient.load({ ns: 'ns:foo', fetch });
      expect(def.ok).to.eql(true);
      expect(def.errors).to.eql([]);
      expect(def.uri).to.eql('ns:foo');
      expect(def.typename).to.eql('MyRow');
      expect(def.columns.map(c => c.column)).to.eql(['A', 'B', 'C']);
    });

    it('"foo" (without "ns:" prefix)', async () => {
      const def = await TypeClient.load({ ns: 'foo', fetch });
      expect(def.ok).to.eql(true);
      expect(def.errors).to.eql([]);
      expect(def.uri).to.eql('ns:foo');
      expect(def.typename).to.eql('MyRow');
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
      expect(def.errors[0].message).to.include(`does not exist`);
      expect(def.errors[0].type).to.eql(ERROR.TYPE.NOT_FOUND);
      expect(def.errors.length).to.eql(1);
    });

    it('error: 404 type definition in column reference not found', async () => {
      const defs = {
        'ns:foo': {
          ns: { type: { typename: 'Foo' } },
          columns: {
            C: { props: { prop: { name: 'color', type: 'ns:foo.color' } } },
          },
        },
      };

      const fetch = testFetch({ defs });
      const def = await TypeClient.load({ ns: 'foo', fetch });
      expect(def.errors.length).to.eql(2);

      expect(def.ok).to.eql(false);
      expect(def.errors[0].message).to.include(`The namespace "ns:foo.color" does not exist.`);
      expect(def.errors[0].type).to.eql(ERROR.TYPE.NOT_FOUND);

      expect(def.errors[1].message).to.include(`Failed to load the referenced type in column 'C'`);
      expect(def.errors[1].type).to.eql(ERROR.TYPE.REF);
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
      expect(error.type).to.eql(ERROR.TYPE.DUPLICATE_PROP);
      expect(error.message).to.include(`The property name 'foo' is duplicated in columns [A,C]`);
    });

    it('error: duplicate object typename (on namespace)', async () => {
      const defs = {
        'ns:foo.1': {
          ns: { type: { typename: 'Foo' } }, // NB: same name.
          columns: {
            A: { props: { prop: { name: 'thing', type: 'ns:foo.2' } } },
          },
        },
        'ns:foo.2': {
          ns: { type: { typename: 'Bar' } }, // NB: same name.
          columns: {
            A: { props: { prop: { name: 'A', type: 'ns:foo.3' } } },
            B: { props: { prop: { name: 'B', type: 'ns:foo.3' } } },
            C: { props: { prop: { name: 'C', type: 'string' } } },
          },
        },
        'ns:foo.3': {
          ns: { type: { typename: 'Bar' } }, // NB: same name.
          columns: {
            A: { props: { prop: { name: 'count', type: 'number' } } },
            B: { props: { prop: { name: 'myRef', type: 'ns:foo.4' } } },
          },
        },
        'ns:foo.4': {
          ns: { type: { typename: 'Foo' } }, // NB: same name.
          columns: {
            A: { props: { prop: { name: 'name', type: 'string' } } },
          },
        },
      };

      const def = await TypeClient.load({ ns: 'foo.1', fetch: testFetch({ defs }) });
      const error = def.errors[0];

      expect(error.type).to.eql(ERROR.TYPE.DUPLICATE_TYPENAME);
      expect(error.message).to.include(`Reference to a duplicate typename 'Foo'`);
    });

    it('error: namespace typename invalid (eg "foo", ".foo", "foo-1")', async () => {
      const test = async (typename: string) => {
        const defs = {
          'ns:foo': {
            ns: { type: { typename } },
            columns: {},
          },
        };
        const ns = 'ns:foo';
        const def = await TypeClient.load({ ns, fetch: testFetch({ defs }) });
        const errors = def.errors;

        expect(def.ok).to.eql(false);
        expect(errors[0].type).to.eql(ERROR.TYPE.DEF_INVALID);
        expect(errors[0].ns).to.eql(ns);
        expect(errors[0].message).to.include(`Must be alpha-numeric`);
      };

      await test('foo');
      await test('1foo');
      await test('Foo.1');
      await test('.Foo');
      await test('Foo-Bar');
    });

    it('error: circular-reference (ns.implements self)', async () => {
      const defs = {
        'ns:foo': {
          ns: { type: { typename: 'Foo', implements: 'ns:foo' } },
          columns: {
            A: { props: { prop: { name: 'A', type: 'string' } } },
          },
        },
      };

      const ns = 'ns:foo';
      const def = await TypeClient.load({ ns, fetch: testFetch({ defs }) });

      expect(def.ok).to.eql(false);
      expect(def.errors.length).to.eql(1);
      expect(def.errors[0].message).to.include(`cannot implement itself (circular-ref)`);
      expect(def.errors[0].type).to.eql(ERROR.TYPE.REF_CIRCULAR);
    });

    it('error: circular-reference (column, self)', async () => {
      const defs = {
        'ns:foo': {
          ns: { type: { typename: 'One' } },
          columns: {
            A: { props: { prop: { name: 'A', type: 'ns:foo' } } }, //     Not OK (self, ns)
            B: { props: { prop: { name: 'B', type: 'cell:foo!A' } } }, // Not OK (a different column)
            C: { props: { prop: { name: 'C', type: 'cell:foo!C' } } }, // Not OK (self, column)
          },
        },
      };

      const ns = 'ns:foo';
      const def = await TypeClient.load({ ns, fetch: testFetch({ defs }) });

      expect(def.ok).to.eql(false);
      expect(def.errors.length).to.eql(1);
      expect(def.errors[0].message).to.include(`namespace (ns:foo) directly references itself`);
      expect(def.errors[0].message).to.include(`in column [A,B,C] (circular-ref)`);
      expect(def.errors[0].type).to.eql(ERROR.TYPE.REF_CIRCULAR);
    });

    it('error: circular-reference - REF(ns) => REF(ns)', async () => {
      const defs = {
        'ns:foo.1': {
          ns: { type: { typename: 'One' } },
          columns: {
            A: { props: { prop: { name: 'two', type: 'ns:foo.2' } } },
          },
        },
        'ns:foo.2': {
          ns: { type: { typename: 'Two' } },
          columns: {
            Z: { props: { prop: { name: 'two', type: 'ns:foo.1' } } },
          },
        },
      };
      const ns = 'ns:foo.1';
      const def = await TypeClient.load({ ns, fetch: testFetch({ defs }) });
      const errors = def.errors;

      expect(def.ok).to.eql(false);
      expect(errors.length).to.eql(3);
      const err1 = errors[0];
      const err2 = errors[1];
      const err3 = errors[2];

      expect(err1.ns).to.eql('ns:foo.1');
      expect(err1.type).to.eql(ERROR.TYPE.REF_CIRCULAR);
      expect(err1.message).to.include(
        `The namespace "ns:foo.1" leads back to itself (circular reference).`,
      );
      expect(err1.message).to.include(`Sequence: ns:foo.1 ➔ ns:foo.2 ➔ ns:foo.1`);

      expect(err2.ns).to.eql('ns:foo.2');
      expect(err2.column).to.eql('Z');
      expect(err2.type).to.eql('TYPE/ref');

      expect(err3.ns).to.eql('ns:foo.1');
      expect(err3.column).to.eql('A');
      expect(err3.type).to.eql('TYPE/ref');
    });

    it('error: circular-reference - REF(column) => REF(ns)', async () => {
      const defs = {
        'ns:foo.1': {
          ns: { type: { typename: 'Foo1' } },
          columns: {
            A: { props: { prop: { name: 'foo2', type: 'cell:foo.2!Z' } } },
          },
        },
        'ns:foo.2': {
          ns: { type: { typename: 'Foo2' } },
          columns: {
            Z: { props: { prop: { name: 'foo1', type: 'ns:foo.1' } } },
          },
        },
      };

      const def = await TypeClient.load({ ns: 'foo.1', fetch: testFetch({ defs }) });
      const errors = def.errors;

      expect(def.ok).to.eql(false);
      expect(errors.length).to.eql(3);
      const err1 = errors[0];
      const err2 = errors[1];
      const err3 = errors[2];

      expect(err1.ns).to.eql('ns:foo.1');
      expect(err1.type).to.eql(ERROR.TYPE.REF_CIRCULAR);
      expect(err1.message).to.include(
        `The namespace "ns:foo.1" leads back to itself (circular reference).`,
      );
      expect(err1.message).to.include(`Sequence: ns:foo.1 ➔ ns:foo.2 ➔ ns:foo.1`);

      expect(err2.ns).to.eql('ns:foo.2');
      expect(err2.column).to.eql('Z');
      expect(err2.type).to.eql('TYPE/ref');

      expect(err3.ns).to.eql('ns:foo.1');
      expect(err3.column).to.eql('A');
      expect(err3.type).to.eql('TYPE/ref');
    });

    it('error: circular-reference - REF(column) => REF(column)', async () => {
      const defs = {
        'ns:foo.1': {
          ns: { type: { typename: 'Foo1' } },
          columns: {
            A: { props: { prop: { name: 'foo2', type: 'cell:foo.2!Z' } } },
          },
        },
        'ns:foo.2': {
          ns: { type: { typename: 'Foo2' } },
          columns: {
            Z: { props: { prop: { name: 'foo1', type: 'cell:foo.1!A' } } },
          },
        },
      };

      const def = await TypeClient.load({ ns: 'foo.1', fetch: testFetch({ defs }) });
      const errors = def.errors;

      expect(def.ok).to.eql(false);
      expect(errors.length).to.eql(3);
      const err1 = errors[0];
      const err2 = errors[1];
      const err3 = errors[2];

      expect(err1.ns).to.eql('ns:foo.1');
      expect(err1.type).to.eql(ERROR.TYPE.REF_CIRCULAR);
      expect(err1.message).to.include(
        `The namespace "ns:foo.1" leads back to itself (circular reference).`,
      );
      expect(err1.message).to.include(`Sequence: ns:foo.1 ➔ ns:foo.2 ➔ ns:foo.1`);

      expect(err2.ns).to.eql('ns:foo.2');
      expect(err2.column).to.eql('Z');
      expect(err2.type).to.eql('TYPE/ref');

      expect(err3.ns).to.eql('ns:foo.1');
      expect(err3.column).to.eql('A');
      expect(err3.type).to.eql('TYPE/ref');
    });
  });

  describe('types', () => {
    describe('empty', () => {
      it('empty: no types / no columns', async () => {
        const defs = {
          'ns:foo.1': {
            ns: { type: { typename: 'Foo1' } },
            columns: {}, // NB: "columns" field deleted below.
          },
          'ns:foo.2': {
            ns: { type: { typename: 'Foo2' } },
            columns: {},
          },
        };

        delete defs['ns:foo.1'].columns;

        const fetch = testFetch({ defs });
        const def1 = await TypeClient.load({ ns: 'foo.1', fetch });
        const def2 = await TypeClient.load({ ns: 'foo.2', fetch });

        expect(def1.columns.length).to.eql(0);
        expect(def2.columns.length).to.eql(0);
      });

      it('column with no "type" prop', async () => {
        const defs = {
          'ns:foo': {
            ns: { type: { typename: 'Foo' } },
            columns: {
              A: { props: { prop: { name: 'title', type: 'string' } } }, // NB: "type" field deleted below.
            },
          },
        };

        const A = defs['ns:foo'].columns.A;

        delete A.props.prop.type;
        expect(defs['ns:foo'].columns.A.props.prop.type).to.eql(undefined);

        const fetch = testFetch({ defs });
        const def = await TypeClient.load({ ns: 'foo', fetch });

        expect(def.columns.length).to.eql(1);
        expect(def.columns[0].type.kind).to.eql('UNKNOWN');
        expect(def.columns[0].type.typename).to.eql('');
      });
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
        expect(C.prop).to.eql('color'); // NB: The "?" is trimmed from the name.

        expect(A.optional).to.eql(undefined);
        expect(B.optional).to.eql(undefined);
        expect(C.optional).to.eql(true); //  NB: The "?" is retained as a boolean flag.

        if (C.type.kind === 'REF') {
          expect(C.type.types[2].prop).to.eql('description');
          expect(C.type.types[2].optional).to.eql(true);
        }
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

    describe('REF(column) => <uri>', () => {
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
        expect(def.ok).to.eql(true);
        expect(def.errors).to.eql([]);

        const A = def.columns[0];
        expect(A.column).to.eql('A');
        expect(A.prop).to.eql('myFoo');
        expect(A.type.kind).to.eql('VALUE');
        expect(A.type.typename).to.eql('string');
      });

      it('REF(column) => ENUM', async () => {
        const def = await TypeClient.load({ ns: 'foo.1', fetch: testFetch({ defs }) });
        expect(def.ok).to.eql(true);
        expect(def.errors).to.eql([]);

        const B = def.columns[1];
        expect(B.column).to.eql('B');
        expect(B.prop).to.eql('myBar');
        expect(B.type.kind).to.eql('UNION');
        expect(B.type.typename).to.eql(`'one' | 'two' | 'three'`);
      });

      it('REF(column) => REF => object (ns)', async () => {
        const def = await TypeClient.load({ ns: 'foo.1', fetch: testFetch({ defs }) });
        expect(def.ok).to.eql(true);
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
        expect(def.ok).to.eql(true);
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
    describe('load method', () => {
      it('caches [load] method (passed in cache)', async () => {
        const fetch = testFetch({ defs: TYPE_DEFS });
        const cache = Cache.toCache();
        const ns = 'foo';
        const def1 = await TypeClient.load({ ns, fetch, cache });
        const def2 = await TypeClient.load({ ns, fetch, cache });
        const def3 = await TypeClient.load({ ns, fetch }); // Not using custom cache (default)

        expect(def1).to.equal(def2);
        expect(def3).to.not.equal(def1);
      });

      it('caches [load] method (parallel execution)', async () => {
        const fetch = testFetch({ defs: TYPE_DEFS });
        const cache = Cache.toCache();

        const ns = 'foo';
        const wait = [TypeClient.load({ ns, fetch, cache }), TypeClient.load({ ns, fetch, cache })];
        const [def1, def2] = await Promise.all(wait);

        const def3 = await TypeClient.load({ ns: 'foo', fetch }); // Not using custom cache (default)

        expect(def1).to.equal(def2);
        expect(def3).to.not.equal(def1);
      });
    });

    describe('fetch', () => {
      const defs = {
        'ns:foo.1': {
          ns: { type: { typename: 'Foo' } },
          columns: {
            A: { props: { prop: { name: 'A', type: 'string' } } },
            B: { props: { prop: { name: 'B', type: 'ns:foo.2' } } },
            C: { props: { prop: { name: 'C', type: 'ns:foo.2' } } },
            D: { props: { prop: { name: 'D', type: 'ns:foo.2!A' } } },
            E: { props: { prop: { name: 'E', type: 'ns:foo.2!A' } } },
          },
        },
        'ns:foo.2': {
          ns: { type: { typename: 'Bar' } },
          columns: {
            A: { props: { prop: { name: 'name', type: 'string' } } },
            B: { props: { prop: { name: 'count', type: 'number' } } },
          },
        },
      };

      it('default cache (within call)', async () => {
        const ns = 'ns:foo.1';
        const fetch = testFetch({ defs });

        await TypeClient.load({ ns, fetch }); // NB: Internal cache used. New on each call.
        expect(fetch.getTypeCount).to.eql(2); // NB: Less that the total number of type lookups passed to fetch.

        // NB: Call count increases as a shared cache was not given.
        await TypeClient.load({ ns, fetch });
        expect(fetch.getTypeCount).to.eql(4);

        await TypeClient.load({ ns, fetch });
        expect(fetch.getTypeCount).to.eql(6);
      });

      it('shared cache (between calls)', async () => {
        const ns = 'ns:foo.1';
        const fetch = testFetch({ defs });
        const cache = Cache.toCache();

        await TypeClient.load({ ns, fetch, cache }); //
        expect(fetch.getTypeCount).to.eql(2);

        await TypeClient.load({ ns, fetch, cache });
        await TypeClient.load({ ns, fetch, cache });
        await TypeClient.load({ ns, fetch, cache });

        expect(fetch.getTypeCount).to.eql(2); // NB: Does not increase. Values retrieved from shared cache.
      });
    });
  });

  describe('typescript', () => {
    describe('declaration', () => {
      it('toString: with header (default)', async () => {
        const def = await TypeClient.load({ ns: 'foo', fetch });
        const res = TypeClient.typescript(def).toString();

        expect(res).to.include('Generated types defined in namespace');
        expect(res).to.include('|➔  ns:foo');
        expect(res).to.include('export declare type MyRow');
        expect(res).to.include('export declare type MyColor');
      });

      it('toString: no header', async () => {
        const def = await TypeClient.load({ ns: 'foo', fetch });
        const res = TypeClient.typescript(def, { header: false }).toString();

        expect(res).to.not.include('Generated types');
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

      it.skip('save DesignDoc (sample)', async () => {
        const defs = {
          'ns:foo.doc': {
            ns: { type: { typename: 'DesignDoc' } },
            columns: {
              A: { props: { prop: { name: 'impact', type: 'ns:foo.doc.section' } } },
              B: { props: { prop: { name: 'context', type: 'ns:foo.doc.section' } } },
              C: { props: { prop: { name: 'outcomes', type: 'ns:foo.doc.section' } } },
              D: { props: { prop: { name: 'principles', type: 'ns:foo.doc.section' } } },
              E: { props: { prop: { name: 'design', type: 'ns:foo.doc.section' } } },
            },
          },
          'ns:foo.doc.section': {
            ns: { type: { typename: 'DesignDocSection' } },
            columns: {
              A: { props: { prop: { name: 'items', type: 'string[]' } } },
              B: { props: { prop: { name: 'status?', type: 'cell:foo.doc.task!A' } } },
            },
          },
          'ns:foo.doc.task': {
            ns: { type: { typename: 'DesignDocTask' } },
            columns: {
              A: { props: { prop: { name: 'completed', type: '"DONE" | "ACTIVE" | "STALE"' } } },
            },
          },
        };

        const fetch = testFetch({ defs });
        const def = await TypeClient.load({ ns: 'design.doc', fetch });

        const ts = TypeClient.typescript(def);
        const dir = fs.join(__dirname, '../test/.d.ts');
        await ts.save(fs, dir, { filename: 'DesignDoc.d.ts' });
      });

      it('dir (filename inferred from type)', async () => {
        const def = await TypeClient.load({ ns: 'foo', fetch });
        const ts = TypeClient.typescript(def);
        const dir = fs.resolve('./tmp/d');
        const res = await ts.save(fs, dir);

        expect(res.path.endsWith('/d/MyRow.d.ts')).to.eql(true);
        expect(res.data).to.eql(ts.declaration); // NB: same as `ts.toString()`

        const file = await fs.readFile(fs.join(dir, 'MyRow.d.ts'));
        expect(file.toString()).to.eql(ts.toString()); // NB: same as `ts.declaration`
      });

      it('dir and filename (explicitly passed)', async () => {
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
