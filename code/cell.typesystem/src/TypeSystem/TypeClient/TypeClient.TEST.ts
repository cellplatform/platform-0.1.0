import { TypeClient } from '.';
import { t, TypeSystem, ERROR, expect, fs, testFetch, TYPE_DEFS } from '../../test';

describe.only('TypeClient', () => {
  const fetch = testFetch({ defs: TYPE_DEFS });

  it('TypeSystem.Client === TypeClient', () => {
    expect(TypeSystem.Client).to.equal(TypeClient);
    expect(TypeSystem.client).to.equal(TypeClient.client);
  });

  describe('load', () => {
    it('"ns:foo"', async () => {
      const res = await TypeClient.load({ ns: 'ns:foo', fetch });
      expect(res.ok).to.eql(true);
      expect(res.errors).to.eql([]);
      expect(res.defs.length).to.eql(1);

      const def = res.defs[0];
      expect(def.ok).to.eql(true);
      expect(def.errors).to.eql([]);
      expect(def.uri).to.eql('ns:foo');
      expect(def.typename).to.eql('MyRow');
      expect(def.columns.map(c => c.column)).to.eql(['A', 'B', 'C', 'D', 'E']);
    });

    it('"foo" (without "ns:" prefix)', async () => {
      const res = await TypeClient.load({ ns: 'foo', fetch });
      expect(res.ok).to.eql(true);
      expect(res.errors).to.eql([]);
      expect(res.defs.length).to.eql(1);

      const def = res.defs[0];
      expect(def.ok).to.eql(true);
      expect(def.errors).to.eql([]);
      expect(def.uri).to.eql('ns:foo');
      expect(def.typename).to.eql('MyRow');
      expect(def.columns.map(c => c.column)).to.eql(['A', 'B', 'C', 'D', 'E']);
    });

    it('"ns:foo.multi" (several return types)', async () => {
      const res = await TypeClient.load({ ns: 'ns:foo.multi', fetch });

      expect(res.ok).to.eql(true);
      expect(res.errors).to.eql([]);
      expect(res.defs.length).to.eql(2);

      const defs = res.defs;
      expect(defs[0].ok).to.eql(true);
      expect(defs[0].errors).to.eql([]);
      expect(defs[0].uri).to.eql('ns:foo.multi');
      expect(defs[0].typename).to.eql('MyOne');
      expect(defs[0].columns.map(c => c.column)).to.eql(['A', 'B']);

      expect(defs[1].ok).to.eql(true);
      expect(defs[1].errors).to.eql([]);
      expect(defs[1].uri).to.eql('ns:foo.multi');
      expect(defs[1].typename).to.eql('MyTwo');
      expect(defs[1].columns.map(c => c.column)).to.eql(['B', 'C']);
    });
  });

  describe('errors', () => {
    it('error: malformed URI', async () => {
      const res = await TypeClient.load({ ns: 'ns:NOT-VALID', fetch });
      expect(res.ok).to.eql(false);
      expect(res.defs.length).to.eql(0);
      expect(res.errors.length).to.eql(1);
      expect(res.errors[0].message).to.include(`invalid "ns" identifier`);
      expect(res.errors[0].type).to.eql(ERROR.TYPE.DEF);
    });

    it('error: not a "ns" uri', async () => {
      const res = await TypeClient.load({ ns: 'cell:foo:A1', fetch });
      expect(res.ok).to.eql(false);
      expect(res.defs.length).to.eql(0);
      expect(res.errors.length).to.eql(1);
      expect(res.errors[0].message).to.include(`Must be "ns"`);
      expect(res.errors[0].type).to.eql(ERROR.TYPE.DEF);
    });

    it('error: failure while loading', async () => {
      const fetch = testFetch({
        defs: TYPE_DEFS,
        before: e => {
          throw new Error('Derp!');
        },
      });
      const res = await TypeClient.load({ ns: 'foo', fetch });
      expect(res.ok).to.eql(false);
      expect(res.defs.length).to.eql(0);
      expect(res.errors.length).to.eql(1);
      expect(res.errors[0].message).to.include(`Failed while loading type for`);
      expect(res.errors[0].message).to.include(`Derp!`);
      expect(res.errors[0].type).to.eql(ERROR.TYPE.DEF);
    });

    it('error: 404 type definition not found', async () => {
      const res = await TypeClient.load({ ns: 'foo.no.exist', fetch });
      expect(res.ok).to.eql(false);
      expect(res.defs.length).to.eql(0);
      expect(res.errors[0].message).to.include(`does not exist`);
      expect(res.errors[0].type).to.eql(ERROR.TYPE.NOT_FOUND);
      expect(res.errors.length).to.eql(1);
    });

    it('error: 404 type definition in column reference not found', async () => {
      const defs = {
        'ns:foo': {
          columns: {
            C: { props: { def: { prop: 'Foo.color', type: 'ns:foo.color/Baz' } } },
          },
        },
      };
      const res = await TypeClient.load({ ns: 'foo', fetch: testFetch({ defs }) });

      expect(res.ok).to.eql(false);
      expect(res.errors.length).to.eql(2);
      expect(res.defs.length).to.eql(1);

      expect(res.errors[0].message).to.include(`The namespace (ns:foo.color) does not exist`);
      expect(res.errors[0].type).to.eql(ERROR.TYPE.NOT_FOUND);

      expect(res.errors[1].message).to.include(`Failed to load referenced type in column 'C'`);
      expect(res.errors[1].type).to.eql(ERROR.TYPE.REF);
    });

    it('error: ref has invalid property-name', async () => {
      const defs = {
        'ns:foo.1': {
          columns: {
            A: { props: { def: { prop: 'Foo1.a', type: 'ns:foo.2/Foo2' } } },
          },
        },
        'ns:foo.2': {
          columns: {
            A: { props: { def: { prop: 'Foo2.1title', type: 'string' } } },
          },
        },
      };
      const res = await TypeClient.load({ ns: 'foo.1', fetch: testFetch({ defs }) });
      const errors = res.errors;

      expect(errors[0].message).to.include('Property-name starts with a number');
      expect(errors[0].type).to.include(ERROR.TYPE.DEF_INVALID);

      expect(errors[1].type).to.include(ERROR.TYPE.REF);
      expect(errors[1].children && errors[1].children[0]).to.eql(errors[0]);
    });

    it('error: duplicate property names', async () => {
      const defs = {
        'ns:foo.error': {
          columns: {
            A: { props: { def: { prop: 'Type.foo', type: 'string' } } },
            B: { props: { def: { prop: 'Type.isEnabled', type: 'string' } } },
            C: { props: { def: { prop: 'Type.foo', type: `'red'` } } },
            D: { props: { def: { prop: 'Type.Foo', type: 'boolean' } } }, // NB: Not duplicate (case-sensitive).
            E: { props: { def: { prop: 'Other.foo', type: `boolean` } } },
          },
        },
      };

      const res = await TypeClient.load({ ns: 'foo.error', fetch: testFetch({ defs }) });
      const error = res.errors[0];

      expect(res.defs.length).to.eql(2);
      expect(res.errors.length).to.eql(1);
      expect(error.type).to.eql(ERROR.TYPE.DUPLICATE_PROP);
      expect(error.message).to.include(
        `The property name 'Type.foo' is duplicated in columns [A,C]`,
      );
    });

    it('error: namespace reference does not include typename', async () => {
      const defs = {
        'ns:foo': {
          columns: {
            A: { props: { def: { prop: 'Foo1.title', type: 'cell:foo.2:A' } } },
            B: { props: { def: { prop: 'Foo1.color', type: 'ns:foo.2' } } },
          },
        },
      };
      const res = await TypeClient.load({ ns: 'foo', fetch: testFetch({ defs }) });
      const errors = res.errors;

      expect(errors.length).to.eql(2);

      expect(errors[0].type).to.eql(ERROR.TYPE.REF_TYPENAME);
      expect(errors[0].column).to.eql('A');
      expect(errors[0].message).to.include(`Should be <uri/typename>`);

      expect(errors[1].type).to.eql(ERROR.TYPE.REF_TYPENAME);
      expect(errors[1].column).to.eql('B');
      expect(errors[1].message).to.include(`Should be <uri/typename>`);
    });

    it('error: duplicate typename (on namespace)', async () => {
      const defs = {
        'ns:foo.1': {
          columns: {
            A: { props: { def: { prop: 'Foo.thing', type: 'ns:foo.2/Bar' } } },
          },
        },
        'ns:foo.2': {
          columns: {
            A: { props: { def: { prop: 'Bar.A', type: 'ns:foo.3/Bar' } } },
            B: { props: { def: { prop: 'Bar.B', type: 'ns:foo.3/Bar' } } },
            C: { props: { def: { prop: 'Bar.C', type: 'string' } } },
          },
        },
        'ns:foo.3': {
          columns: {
            A: { props: { def: { prop: 'Bar.count', type: 'number' } } },
            B: { props: { def: { prop: 'Bar.myRef', type: 'ns:foo.4/Foo' } } },
          },
        },
        'ns:foo.4': {
          columns: {
            A: { props: { def: { prop: 'Foo.name', type: 'string' } } },
          },
        },
      };

      const res = await TypeClient.load({ ns: 'foo.1', fetch: testFetch({ defs }) });
      const error = res.errors[0];

      expect(error.type).to.eql(ERROR.TYPE.DUPLICATE_TYPENAME);
      expect(error.message).to.include(`Reference to a duplicate typename 'Foo'`);
    });

    it('error: namespace typename invalid (eg "foo", ".foo", "foo-1")', async () => {
      const test = async (typename: string) => {
        const defs = {
          'ns:foo': {
            ns: { type: {} },
            columns: {
              A: { props: { def: { prop: `${typename}.title`, type: 'string' } } },
            },
          },
        };
        const ns = 'ns:foo';
        const res = await TypeClient.load({ ns, fetch: testFetch({ defs }) });
        const errors = res.errors;

        expect(res.ok).to.eql(false);
        expect(errors[0].type).to.eql(ERROR.TYPE.DEF_INVALID);
        expect(errors[0].ns).to.eql(ns);
        expect(errors[0].message).to.include(`Must be alpha-numeric`);
      };

      await test('foo');
      await test('1foo');
      await test('Foo bar');
      await test('Foo-Bar');
    });

    it('error: propname invalid (eg "foo-1", "foo bar", "foo.bar")', async () => {
      const test = async (propname: string) => {
        const defs = {
          'ns:foo': {
            ns: { type: {} },
            columns: {
              A: { props: { def: { prop: `Foo.${propname}`, type: 'string' } } },
            },
          },
        };
        const ns = 'ns:foo';
        const res = await TypeClient.load({ ns, fetch: testFetch({ defs }) });
        const errors = res.errors;

        expect(res.ok).to.eql(false);
        expect(errors[0].type).to.eql(ERROR.TYPE.DEF_INVALID);
        expect(errors[0].ns).to.eql(ns);
        expect(errors[0].message).to.include(`Must be alpha-numeric`);
      };

      await test('1foo');
      await test('foo bar');
      await test('foo-Bar');
      await test('foo*Bar');
    });

    it('error: circular-reference (ns.implements self)', async () => {
      const defs = {
        'ns:foo': {
          ns: { type: { implements: 'ns:foo' } },
          columns: {
            A: { props: { def: { prop: 'Foo.A', type: 'string' } } },
          },
        },
      };

      const ns = 'ns:foo';
      const res = await TypeClient.load({ ns, fetch: testFetch({ defs }) });

      expect(res.ok).to.eql(false);
      expect(res.errors.length).to.eql(1);
      expect(res.errors[0].message).to.include(`cannot implement itself (circular-ref)`);
      expect(res.errors[0].type).to.eql(ERROR.TYPE.REF_CIRCULAR);
    });

    it('error: circular-reference (column, self)', async () => {
      const defs = {
        'ns:foo': {
          columns: {
            A: { props: { def: { prop: 'Foo.A', type: 'ns:foo' } } }, //     Not OK (self, ns)
            B: { props: { def: { prop: 'Foo.B', type: 'cell:foo:A' } } }, // Not OK (a different column)
            C: { props: { def: { prop: 'Foo.C', type: 'cell:foo:C' } } }, // Not OK (self, column)
          },
        },
      };

      const ns = 'ns:foo';
      const res = await TypeClient.load({ ns, fetch: testFetch({ defs }) });

      expect(res.ok).to.eql(false);
      expect(res.errors.length).to.eql(1);
      expect(res.errors[0].message).to.include(`namespace (ns:foo) directly references itself`);
      expect(res.errors[0].message).to.include(`in column [A,B,C] (circular-ref)`);
      expect(res.errors[0].type).to.eql(ERROR.TYPE.REF_CIRCULAR);
    });

    it('error: circular-reference - REF(ns) => REF(ns)', async () => {
      const defs = {
        'ns:foo.1': {
          columns: {
            A: { props: { def: { prop: 'Foo1.prop', type: 'ns:foo.2/Foo2' } } },
          },
        },
        'ns:foo.2': {
          columns: {
            Z: { props: { def: { prop: 'Foo2.prop', type: 'ns:foo.1/Foo1' } } },
          },
        },
      };
      const ns = 'ns:foo.1';
      const res = await TypeClient.load({ ns, fetch: testFetch({ defs }) });
      const errors = res.errors;

      expect(res.ok).to.eql(false);
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
          columns: {
            A: { props: { def: { prop: 'Foo1.foo2', type: 'cell:foo.2:Z/Foo2' } } },
          },
        },
        'ns:foo.2': {
          columns: {
            Z: { props: { def: { prop: 'Foo2.foo1', type: 'ns:foo.1/Foo1' } } },
          },
        },
      };

      const res = await TypeClient.load({ ns: 'foo.1', fetch: testFetch({ defs }) });
      const errors = res.errors;

      expect(res.ok).to.eql(false);
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
          columns: {
            A: { props: { def: { prop: 'Foo1.foo2', type: 'cell:foo.2:Z/Foo2' } } },
          },
        },
        'ns:foo.2': {
          columns: {
            Z: { props: { def: { prop: 'Foo2.foo1', type: 'cell:foo.1:A/Foo1' } } },
          },
        },
      };

      const res = await TypeClient.load({ ns: 'foo.1', fetch: testFetch({ defs }) });
      const errors = res.errors;

      expect(res.ok).to.eql(false);
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

    it('error: circular-reference - nested UNION (ns)', async () => {
      const defs = {
        'ns:foo.1': {
          ns: { type: {} },
          columns: {
            A: { props: { def: { prop: 'Foo1.foo2', type: 'cell:foo.2:Z/Foo2' } } },
          },
        },
        'ns:foo.2': {
          ns: { type: {} },
          columns: {
            Z: {
              props: { def: { prop: 'Foo2.foo1', type: 'boolean | (ns:foo.1/Foo1 | string)' } },
            },
          },
        },
      };

      const res = await TypeClient.load({ ns: 'foo.1', fetch: testFetch({ defs }) });
      const errors = res.errors;

      expect(res.ok).to.eql(false);
      expect(errors.length).to.eql(3);
      const err1 = errors[0];

      expect(err1.ns).to.eql('ns:foo.1');
      expect(err1.type).to.eql(ERROR.TYPE.REF_CIRCULAR);
      expect(err1.message).to.include(
        `The namespace "ns:foo.1" leads back to itself (circular reference).`,
      );
      expect(err1.message).to.include(`Sequence: ns:foo.1 ➔ ns:foo.2 ➔ ns:foo.1`);
    });

    it('error: circular-reference - nested UNION (column)', async () => {
      const defs = {
        'ns:foo.1': {
          ns: { type: {} },
          columns: {
            A: { props: { def: { prop: 'Foo1.foo2', type: 'cell:foo.2:Z/Foo2' } } },
          },
        },
        'ns:foo.2': {
          ns: { type: {} },
          columns: {
            Z: {
              props: { def: { prop: 'Foo2.foo1', type: 'boolean | (cell:foo.1:A/Foo1 | string)' } },
            },
          },
        },
      };

      const res = await TypeClient.load({ ns: 'foo.1', fetch: testFetch({ defs }) });
      const errors = res.errors;

      expect(res.ok).to.eql(false);
      expect(errors.length).to.eql(3);
      const err1 = errors[0];

      expect(err1.ns).to.eql('ns:foo.1');
      expect(err1.type).to.eql(ERROR.TYPE.REF_CIRCULAR);
      expect(err1.message).to.include(
        `The namespace "ns:foo.1" leads back to itself (circular reference).`,
      );
      expect(err1.message).to.include(`Sequence: ns:foo.1 ➔ ns:foo.2 ➔ ns:foo.1`);
    });
  });

  describe('types', () => {
    describe('empty', () => {
      it('empty: no types / no columns', async () => {
        const defs = {
          'ns:foo.1': {
            ns: { type: {} },
            columns: {}, // NB: "columns" field deleted below.
          },
          'ns:foo.2': {
            ns: { type: {} },
            columns: {},
          },
        };

        delete defs['ns:foo.1'].columns;

        const fetch = testFetch({ defs });
        const res1 = await TypeClient.load({ ns: 'foo.1', fetch });
        const res2 = await TypeClient.load({ ns: 'foo.2', fetch });

        expect(res1.defs).to.eql([]);
        expect(res2.defs).to.eql([]);

        expect(res1.errors).to.eql([]);
        expect(res2.errors).to.eql([]);
      });

      it('column with no "type" prop', async () => {
        const defs = {
          'ns:foo': {
            ns: { type: {} },
            columns: {
              A: { props: { def: { prop: 'Foo.title', type: 'string' } } }, // NB: "type" field deleted below.
            },
          },
        };

        const A = defs['ns:foo'].columns.A;

        delete A.props.def.type;
        expect(defs['ns:foo'].columns.A.props.def.type).to.eql(undefined);

        const fetch = testFetch({ defs });
        const res = await TypeClient.load({ ns: 'foo', fetch });
        const def = res.defs[0];

        expect(def.columns.length).to.eql(1);
        expect(def.columns[0].type.kind).to.eql('UNKNOWN');
        expect(def.columns[0].type.typename).to.eql('');
      });
    });

    describe('VALUE (primitives)', () => {
      const test = async (column: string, typename: string, defaultValue?: any) => {
        const fetch = testFetch({ defs: TYPE_DEFS });
        const res = await TypeClient.load({ ns: 'foo.primitives', fetch });
        const match = res.defs[0].columns.find(c => c.column === column);
        expect(match).to.not.eql(undefined);
        if (match) {
          expect(match.type.kind).to.eql('VALUE');
          expect(match.type.typename).to.eql(typename);
          if (defaultValue) {
            expect(match.default).to.eql({ value: defaultValue });
          }
        }
      };

      it('string', async () => {
        await test('A', 'string', 'Hello (Default)');
      });

      it('number', async () => {
        await test('B', 'number', 999);
      });

      it('boolean', async () => {
        await test('C', 'boolean', true);
      });
    });

    describe('REF(ns) - object', () => {
      it('REF object-type, n-level deep ("ns:xxx")', async () => {
        const fetch = testFetch({ defs: TYPE_DEFS });
        const def = (await TypeClient.load({ ns: 'foo', fetch })).defs[0];

        const A = def.columns[0];
        const B = def.columns[1];
        const C = def.columns[2];
        const D = def.columns[3];

        expect(A.type.kind).to.eql('VALUE');
        expect(A.type.typename).to.eql('string');

        expect(B.type.kind).to.eql('UNION');
        expect(B.type.typename).to.eql('boolean | null');

        expect(C.type.kind).to.eql('REF');
        expect(C.type.typename).to.eql('MyColor');

        if (C.type.kind === 'REF') {
          expect(C.type.kind).to.eql('REF');
          expect(C.type.uri).to.eql('ns:foo.color');
          expect(C.type.types.length).to.eql(3);
        }

        expect(D.type.kind).to.eql('UNION');
        expect(D.type.typename).to.eql('MyMessage | null');

        if (D.type.kind === 'UNION') {
          expect(D.type.kind).to.eql('UNION');
          expect(D.type.typename).to.eql('MyMessage | null');
          expect(D.type.types[0].typename).to.eql('MyMessage');
          expect(D.type.types[1].typename).to.eql('null');
        }
      });

      it('REF optional property', async () => {
        const fetch = testFetch({ defs: TYPE_DEFS });
        const def = (await TypeClient.load({ ns: 'foo', fetch })).defs[0];

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
          expect(C.type.typename).to.eql('MyColor');
        }
      });

      it('REF default value', async () => {
        const fetch = testFetch({ defs: TYPE_DEFS });
        const def = (await TypeClient.load({ ns: 'foo', fetch })).defs[0];

        const A = def.columns[0];
        const B = def.columns[1];

        expect(A.default).to.eql({ value: 'Untitled' });
        expect(B.default).to.eql(undefined);
      });

      it('REF union: "ns:<id> | null"', async () => {
        const fetch = testFetch({ defs: TYPE_DEFS });
        const def = (await TypeClient.load({ ns: 'foo', fetch })).defs[0];
        const D = def.columns[3];

        expect(D.type.kind).to.eql('UNION');
        expect(D.type.typename).to.eql('MyMessage | null');

        if (D.type.kind === 'UNION') {
          expect(D.type.types[0].kind).to.eql('REF');
          expect(D.type.types[1].kind).to.eql('VALUE');
          expect(D.type.types[1].typename).to.eql('null');

          const MyMessage = D.type.types[0] as t.ITypeRef;
          expect(MyMessage.typename).to.eql('MyMessage'); // NB: typename resolved.
          expect(MyMessage.types.length).to.eql(3);
        }
      });

      it('REF nested unions: "boolean | (ns:<id> | string)"', async () => {
        const fetch = testFetch({ defs: TYPE_DEFS });
        const def = (await TypeClient.load({ ns: 'foo.nested', fetch })).defs[0];
        const C = def.columns[2];

        expect(C.type.kind).to.eql('UNION');
        expect(C.type.typename).to.eql('boolean | (MyColor | string)');

        if (C.type.kind === 'UNION') {
          expect(C.type.types[1].kind).to.eql('UNION');
          if (C.type.types[1].kind === 'UNION') {
            expect(C.type.types[1].types[0].typename).to.eql('MyColor'); // NB: typename resolved.
          }
        }
      });

      it('REF array', async () => {
        const fetch = testFetch({ defs: TYPE_DEFS });
        const def = (await TypeClient.load({ ns: 'foo.messages', fetch })).defs[0];

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

      it('REF(ns) - default/optional retrieved', async () => {
        const defs = {
          'ns:foo.1': {
            columns: {
              A: { props: { def: { prop: 'Foo1.myFoo', type: 'ns:foo.2/Foo2' } } },
            },
          },
          'ns:foo.2': {
            columns: {
              A: { props: { def: { prop: 'Foo2.foo?', type: 'string', default: 'Untitled' } } },
            },
          },
        };

        const def = (await TypeClient.load({ ns: 'foo.1', fetch: testFetch({ defs }) })).defs[0];
        const A = def.columns[0];

        expect(A.type.kind).to.eql('REF');
        if (A.type.kind === 'REF') {
          expect(A.type.types[0].optional).to.eql(true);
          expect(A.type.types[0].default).to.eql({ value: 'Untitled' });
        }
      });

      it('REF(ns): ref[] - defaults retrieved', async () => {
        const defs = {
          'ns:foo.1': {
            columns: {
              A: { props: { def: { prop: 'Foo1.myFoo', type: 'ns:foo.2/Foo2[]', target: 'ref' } } },
            },
          },
          'ns:foo.2': {
            columns: {
              A: { props: { def: { prop: 'Foo2.count', type: 'number', default: -1 } } },
            },
          },
        };

        const def = (await TypeClient.load({ ns: 'foo.1', fetch: testFetch({ defs }) })).defs[0];
        const A = def.columns[0];

        expect(A.default).to.eql(undefined);
        expect(A.type.isArray).to.eql(true);

        expect(A.type.kind).to.eql('REF');
        if (A.type.kind === 'REF') {
          expect(A.type.types[0].default).to.eql({ value: -1 });
        }
      });
    });

    describe('REF(column) => <uri>', () => {
      const defs = {
        'ns:foo.1': {
          columns: {
            A: { props: { def: { prop: 'Foo1.myFoo', type: 'cell:foo.2:A/Foo2' } } },
            B: { props: { def: { prop: 'Foo1.myBar', type: 'cell:foo.2:B/Foo2' } } },
            C: { props: { def: { prop: 'Foo1.myObjectRef', type: 'cell:foo.2:C/Foo2' } } },
            D: { props: { def: { prop: 'Foo1.myColumnRef', type: 'cell:foo.2:D/Foo2' } } },
          },
        },
        'ns:foo.2': {
          columns: {
            A: { props: { def: { prop: 'Foo2.foo', type: 'string', default: 'Untitled' } } },
            B: { props: { def: { prop: 'Foo2.bar?', type: '"one" | "two" | "three"' } } },
            C: { props: { def: { prop: 'Foo2.baz', type: 'ns:foo.3/Foo3' } } },
            D: { props: { def: { prop: 'Foo2.zoo', type: 'cell:foo.3:A/Foo3' } } },
          },
        },
        'ns:foo.3': {
          columns: {
            A: { props: { def: { prop: 'Foo3.hello', type: 'number[] | boolean' } } },
          },
        },
      };

      it('REF(column) => VALUE (primitive): multi-hop', async () => {
        const res1 = await TypeClient.load({ ns: 'foo.1', fetch: testFetch({ defs }) });
        const res2 = await TypeClient.load({ ns: 'foo.2', fetch: testFetch({ defs }) });

        const def1 = res1.defs[0];
        const def2 = res2.defs[0];

        expect(def1.ok).to.eql(true);
        expect(def1.errors).to.eql([]);

        expect(def2.ok).to.eql(true);
        expect(def2.errors).to.eql([]);

        const targetA = def2.columns[0];
        expect(targetA.default).to.eql({ value: 'Untitled' });

        const A = def1.columns[0];

        expect(A.column).to.eql('A');
        expect(A.prop).to.eql('myFoo');
        expect(A.type.kind).to.eql('VALUE');
        expect(A.type.typename).to.eql('string');
        expect(A.default).to.eql({ value: 'Untitled' });
      });

      it('REF(column) => ENUM', async () => {
        const def = (await TypeClient.load({ ns: 'foo.1', fetch: testFetch({ defs }) })).defs[0];
        const B = def.columns[1];
        expect(B.column).to.eql('B');
        expect(B.prop).to.eql('myBar');
        expect(B.type.kind).to.eql('UNION');
        expect(B.type.typename).to.eql(`'one' | 'two' | 'three'`);
        expect(B.optional).to.eql(undefined); // NB: The optional quality of the referenced prop is not imported. This is a function of the "prop?" question-mark.
      });

      it('REF(column) - override default', async () => {
        const defs = {
          'ns:foo.1': {
            columns: {
              A: { props: { def: { prop: 'Foo1.myFoo', type: 'cell:foo.2:A', default: 'Hello' } } },
            },
          },
          'ns:foo.2': {
            columns: {
              A: { props: { def: { prop: 'Foo2.foo', type: 'string', default: 'Untitled' } } },
            },
          },
        };
        const def = (await TypeClient.load({ ns: 'foo.1', fetch: testFetch({ defs }) })).defs[0];
        const A = def.columns[0];

        expect(A.default).to.eql({ value: 'Hello' }); // NB: The closest default to the declaration wins.
      });

      it('REF(column) => REF => object (ns)', async () => {
        const def = (await TypeClient.load({ ns: 'foo.1', fetch: testFetch({ defs }) })).defs[0];
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
        const def = (await TypeClient.load({ ns: 'foo.1', fetch: testFetch({ defs }) })).defs[0];
        expect(def.ok).to.eql(true);
        expect(def.errors).to.eql([]);

        const D = def.columns[3];
        expect(D.column).to.eql('D');
        expect(D.prop).to.eql('myColumnRef');
        expect(D.type.kind).to.eql('UNION');
        expect(D.type.typename).to.eql('number[] | boolean');
        if (D.type.kind === 'UNION') {
          expect(D.type.types[0].typename).to.eql('number');
          expect(D.type.types[0].isArray).to.eql(true);

          expect(D.type.types[1].typename).to.eql('boolean');
          expect(D.type.types[1].isArray).to.eql(undefined);
        }
      });
    });

    describe('ENUM', () => {
      it('(single)', async () => {
        const fetch = testFetch({ defs: TYPE_DEFS });
        const def = (await TypeClient.load({ ns: 'foo.enum', fetch })).defs[0];
        const A = def.columns[0];
        expect(A.type.kind).to.eql('ENUM');
        expect(A.type.typename).to.eql(`'hello'`);
      });

      it('(union)', async () => {
        const fetch = testFetch({ defs: TYPE_DEFS });
        const def = (await TypeClient.load({ ns: 'foo.enum', fetch })).defs[0];
        const B = def.columns[1];
        const type = B.type;

        expect(type.kind).to.eql('UNION');
        expect(type.typename).to.eql(`'red' | 'green' | 'blue'[]`);
        expect(type.isArray).to.eql(undefined);

        if (type.kind === 'UNION') {
          expect(type.types[0].kind).to.eql('ENUM');
          expect(type.types[0].typename).to.eql(`'red'`);

          expect(type.types[1].kind).to.eql('ENUM');
          expect(type.types[1].typename).to.eql(`'green'`);

          expect(type.types[2].kind).to.eql('ENUM');
          expect(type.types[2].typename).to.eql(`'blue'`);
          expect(type.types[2].isArray).to.eql(true);
        }
      });

      it('(array)', async () => {
        const fetch = testFetch({ defs: TYPE_DEFS });
        const def = (await TypeClient.load({ ns: 'foo.enum', fetch })).defs[0];
        const C = def.columns[2];
        const type = C.type;

        expect(type.kind).to.eql('UNION');
        expect(type.typename).to.eql(`('red' | 'green' | 'blue')[]`);
        expect(type.isArray).to.eql(true);

        if (type.kind === 'UNION') {
          expect(type.types[0].kind).to.eql('ENUM');
          expect(type.types[0].typename).to.eql(`'red'`);
          expect(type.types[0].isArray).to.eql(undefined);

          expect(type.types[1].kind).to.eql('ENUM');
          expect(type.types[1].typename).to.eql(`'green'`);
          expect(type.types[1].isArray).to.eql(undefined);

          expect(type.types[2].kind).to.eql('ENUM');
          expect(type.types[2].typename).to.eql(`'blue'`);
          expect(type.types[2].isArray).to.eql(undefined);
        }
      });
    });
  });

  describe('cache', () => {
    describe('load method', () => {
      it('caches [load] method (passed in cache)', async () => {
        const fetch = testFetch({ defs: TYPE_DEFS });
        const cache = TypeSystem.Cache.create();
        const ns = 'foo';
        const def1 = (await TypeClient.load({ ns, fetch, cache })).defs[0];
        const def2 = (await TypeClient.load({ ns, fetch, cache })).defs[0];
        const def3 = (await TypeClient.load({ ns, fetch })).defs[0]; // Not using custom cache (default)

        expect(def1).to.equal(def2);
        expect(def3).to.not.equal(def1);
      });

      it('caches [load] method (parallel execution)', async () => {
        const fetch = testFetch({ defs: TYPE_DEFS });
        const cache = TypeSystem.Cache.toCache();

        const ns = 'foo';
        const wait = [TypeClient.load({ ns, fetch, cache }), TypeClient.load({ ns, fetch, cache })];
        const [def1, def2] = await Promise.all(wait);

        const def3 = (await TypeClient.load({ ns: 'foo', fetch })).defs[0]; // Not using custom cache (default)

        expect(def1).to.equal(def2);
        expect(def3).to.not.equal(def1);
      });
    });

    describe('fetch', () => {
      const defs = {
        'ns:foo.1': {
          ns: { type: {} },
          columns: {
            A: { props: { def: { prop: 'Foo.A', type: 'string' } } },
            B: { props: { def: { prop: 'Foo.B', type: 'ns:foo.2/Bar' } } },
            C: { props: { def: { prop: 'Foo.C', type: 'ns:foo.2/Bar' } } },
            D: { props: { def: { prop: 'Foo.D', type: 'ns:foo.2:A/Bar' } } },
            E: { props: { def: { prop: 'Foo.E', type: 'ns:foo.2:A/Bar' } } },
          },
        },
        'ns:foo.2': {
          ns: { type: {} },
          columns: {
            A: { props: { def: { prop: 'Bar.name', type: 'string' } } },
            B: { props: { def: { prop: 'Bar.count', type: 'number' } } },
          },
        },
      };

      it('default cache (within call)', async () => {
        const ns = 'ns:foo.1';
        const fetch = testFetch({ defs });

        await TypeClient.load({ ns, fetch }); // NB: Internal cache used. New on each call).
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
        const cache = TypeSystem.Cache.toCache();

        await TypeClient.load({ ns, fetch, cache });
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
        const def = (await TypeClient.load({ ns: 'foo', fetch })).defs[0];
        const res = TypeClient.typescript(def).toString();

        expect(res).to.include('Generated types defined in namespace');
        expect(res).to.include('|➔  ns:foo');
        expect(res).to.include('export declare type MyRow');
        expect(res).to.include('export declare type MyColor');
      });

      it('toString: no header', async () => {
        const def = (await TypeClient.load({ ns: 'foo', fetch })).defs[0];
        const res = TypeClient.typescript(def, { header: false }).toString();

        expect(res).to.not.include('Generated types');
        expect(res).to.include('export declare type MyRow');
        expect(res).to.include('export declare type MyColor');
      });

      it('ref: row/cursor wrapper', async () => {
        const def = (await TypeClient.load({ ns: 'foo', fetch })).defs[0];
        const res = TypeClient.typescript(def, { header: false }).toString();

        expect(res).to.include(`message: t.ITypedSheetRef<MyMessage> | null;\n`);
        expect(res).to.include(`messages: t.ITypedSheetRefs<MyMessage>;\n`);
        expect(res).to.include(`color?: MyColor;\n`); // NB: This is an external type reference but it not {target:'ref'} rather it is INLINE.
      });

      it('REF(column) write to typescript', async () => {
        const defs = {
          'ns:foo.1': {
            columns: {
              A: {
                props: { def: { prop: 'Foo1.myFoo?', type: 'cell:foo.2:A/Foo2', target: 'ref' } },
              },
            },
          },
          'ns:foo.2': {
            columns: {
              A: { props: { def: { prop: 'Foo2.count', type: 'number' } } },
            },
          },
        };
        const def = (await TypeClient.load({ ns: 'foo.1', fetch: testFetch({ defs }) })).defs[0];
        const res = TypeClient.typescript(def, { header: false }).toString();
        expect(res).to.include(`export declare type Foo1 = {\n`);
        expect(res).to.include(`myFoo?: number;\n`);
      });
    });

    describe('save file (.d.ts)', () => {
      const fetch = testFetch({ defs: TYPE_DEFS });

      it('dir (filename inferred from type)', async () => {
        const def = (await TypeClient.load({ ns: 'foo', fetch })).defs[0];
        const ts = TypeClient.typescript(def);
        const dir = fs.resolve('./tmp/d');
        const res = await ts.save(fs, dir);

        expect(res.path.endsWith('/d/MyRow.ts')).to.eql(true);

        const file = (await fs.readFile(fs.join(dir, 'MyRow.ts'))).toString();

        expect(file).to.include(`import * as t from './MyRow.ts';`);
        expect(file).to.include(`export declare type MyRow = {`);
        expect(file).to.include(`export declare type MyColor = {`);
        expect(file).to.include(`export declare type MyMessage = {`);
      });

      it('dir and filename (explicitly passed)', async () => {
        const def = (await TypeClient.load({ ns: 'foo', fetch })).defs[0];
        const ts = TypeClient.typescript(def);

        const dir = fs.resolve('tmp/d');
        const res1 = await ts.save(fs, dir, { filename: 'Foo.txt' }); // NB: ".ts" automatically added.
        const res2 = await ts.save(fs, dir, { filename: 'Foo.d.ts' });

        expect(res1.path.endsWith('/d/Foo.txt.ts')).to.eql(true);
        expect(res2.path.endsWith('/d/Foo.d.ts')).to.eql(true);

        const file1 = (await fs.readFile(fs.join(dir, 'Foo.txt.ts'))).toString();
        const file2 = (await fs.readFile(fs.join(dir, 'Foo.d.ts'))).toString();

        expect(file1).to.include(`import * as t from './Foo.txt.ts';`);
        expect(file1).to.include(`export declare type MyRow = {`);
        expect(file1).to.include(`export declare type MyColor = {`);
        expect(file1).to.include(`export declare type MyMessage = {`);

        expect(file2).to.include(`import * as t from './Foo.d.ts';`);
        expect(file2).to.include(`export declare type MyRow = {`);
        expect(file2).to.include(`export declare type MyColor = {`);
        expect(file2).to.include(`export declare type MyMessage = {`);
      });
    });
  });
});
