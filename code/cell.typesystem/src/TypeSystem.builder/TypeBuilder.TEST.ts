import { t, expect, Uri } from '../test';
import { TypeBuilder } from '.';
import { TypeBuilderNs } from './TypeBuilderNs';
import { TypeBuilderType } from './TypeBuilderType';

describe('TypeBuilder', () => {
  it('create', () => {
    const builder = TypeBuilder.create();
    expect(builder).to.be.an.instanceof(TypeBuilder);
  });

  describe('toObject', () => {
    it('empty', () => {
      const builder = TypeBuilder.create();
      expect(builder.toObject()).to.eql({});
    });

    it('empty namespaces', () => {
      const builder = TypeBuilder.create();
      builder.ns('foo.1');
      builder.ns('foo.2');
      expect(builder.toObject()).to.eql({
        'ns:foo.1': { columns: {} },
        'ns:foo.2': { columns: {} },
      });
    });

    it('simple', () => {
      const builder = TypeBuilder.create();

      builder
        .ns('foo')
        .type('MyType')
        .prop(' title ', { target: 'inline:title', default: 'Untitled' })
        .prop('count', 'number');

      const obj = builder.toObject();
      const columns = obj['ns:foo'].columns;
      const A = columns.A?.props?.def as t.CellTypeDef;
      const B = columns.B?.props?.def as t.CellTypeDef;

      expect(A.prop).to.eql('MyType.title');
      expect(A.type).to.eql('string');
      expect(A.target).to.eql('inline:title');
      expect(A.default).to.eql('Untitled');

      expect(B.prop).to.eql('MyType.count');
      expect(B.type).to.eql('number');
      expect(B.target).to.eql(undefined);
      expect(B.default).to.eql(undefined);
    });

    it('multi-type', () => {
      const builder = TypeBuilder.create();
      const ns = builder.ns('foo');

      ns.type('Type1').prop('foo');
      ns.type('Type2').prop('foo', prop => prop.type('number').default(123));

      const obj = builder.toObject();
      const columns = obj['ns:foo'].columns;
      const A = columns.A?.props?.def as t.CellTypeDef[];

      expect(A[0].prop).to.eql('Type1.foo');
      expect(A[0].type).to.eql('string');
      expect(A[0].target).to.eql(undefined);
      expect(A[0].default).to.eql(undefined);

      expect(A[1].prop).to.eql('Type2.foo');
      expect(A[1].type).to.eql('number');
      expect(A[1].target).to.eql(undefined);
      expect(A[1].default).to.eql(123);
    });

    describe('lookup namespace reference for typename (starts with "/")', () => {
      it('from explicit namespaces', () => {
        const builder = TypeBuilder.create();
        const type1 = builder.ns('foo.1').type('Type1');
        const type2 = builder.ns('foo.2').type('Type2');

        type1.prop('one', '/Type2[]');
        type2.prop('two', prop => prop.type('/Type1').target('ref'));

        const obj = builder.toObject();

        const columns1 = obj['ns:foo.1'].columns;
        const columns2 = obj['ns:foo.2'].columns;

        const def1 = columns1.A?.props?.def as t.CellTypeDef;
        const def2 = columns2.A?.props?.def as t.CellTypeDef;

        expect(def1.type).to.eql('ns:foo.2/Type2[]');
        expect(def2.type).to.eql('ns:foo.1/Type1');
      });

      it('from generated namespaces (eg. builder.type(typename)) ', () => {
        const builder = TypeBuilder.create();

        const type1 = builder.type('Type1');
        const type2 = builder.type('Type2');

        type1.prop('one', '/Type2[]');
        type2.prop('two', prop => prop.type('/Type1').target('ref'));

        const obj = builder.toObject();

        const columns1 = obj[type1.uri.toString()].columns;
        const columns2 = obj[type2.uri.toString()].columns;

        const def1 = columns1.A?.props?.def as t.CellTypeDef;
        const def2 = columns2.A?.props?.def as t.CellTypeDef;

        expect(def1.type).to.eql(`${type2.uri.toString()}/Type2[]`);
        expect(def2.type).to.eql(`${type1.uri.toString()}/Type1`);
      });

      it('throw: failed lookup (not found)', () => {
        const builder = TypeBuilder.create();
        const foo1 = builder.ns('foo.1').type('Type1');
        foo1.prop('one', '/Type2');

        const fn = () => builder.toObject();
        expect(fn).to.throw(/Failed to prefix type '\/Type2' with namespace/);
      });
    });
  });

  describe('builder.ns', () => {
    it('from uri: string', () => {
      const ns = TypeBuilder.create().ns('foo');
      expect(ns).to.be.an.instanceof(TypeBuilderNs);
      expect(ns.uri.toString()).to.eql('ns:foo');
    });

    it('from uri: object', () => {
      const uri = Uri.ns('foo');
      const ns = TypeBuilder.create().ns(uri);
      expect(ns).to.be.an.instanceof(TypeBuilderNs);
      expect(ns.uri.toString()).to.eql('ns:foo');
    });

    describe('errors', () => {
      it('throw: namespace already added', () => {
        const builder = TypeBuilder.create();
        builder.ns('foo');
        const fn = () => builder.ns('foo');
        expect(fn).to.throw(/namespace 'ns:foo' already exists/);
      });
    });
  });

  describe('builder.type (generate namespace)', () => {
    it('typename', () => {
      const builder = TypeBuilder.create();
      const res = builder.type('MyType');
      expect(res).to.be.an.instanceof(TypeBuilderType);
      expect(res.typename).to.eql('MyType');
      expect(res.uri.type).to.eql('NS');
      expect(res.uri.id.length).to.greaterThan(10);
    });

    it('typename (options)', () => {
      const builder = TypeBuilder.create();
      const res = builder.type('MyType', { startColumn: 3 }) as TypeBuilderType;
      expect(res.typename).to.eql('MyType');
      expect(res.startColumn).to.eql(3);
    });
  });

  describe('builder.ns.type', () => {
    it('typename', () => {
      const ns = TypeBuilder.create().ns('foo');
      const type = ns.type('  MyType  ');
      expect(type).to.be.an.instanceof(TypeBuilderType);
      expect(type.uri.toString()).to.eql('ns:foo');
      expect(type.typename).to.eql('MyType');
    });

    it('store type-builder reference', () => {
      const ns = TypeBuilder.create().ns('foo');
      const type = ns.type('MyType');
      expect(ns.types.some(item => item === type)).to.eql(true);
    });

    it('startColumn: "A" ➔ 0', () => {
      const test = (startColumn: number | string, expected: number) => {
        const type = TypeBuilder.create()
          .ns('foo')
          .type('MyType', { startColumn }) as TypeBuilderType;
        expect(type.startColumn).to.eql(expected);
      };
      test('A', 0);
      test('B', 1);
      test(0, 0);
      test(99, 99);
    });

    describe('errors', () => {
      it('throw: invalid typename', () => {
        const test = (typename: string) => {
          const ns = TypeBuilder.create().ns('foo');
          const fn = () => ns.type(typename);
          expect(fn).to.throw();
        };
        test('foo');
        test('Foo Bar');
      });

      it('throw: duplicate typename', () => {
        const ns = TypeBuilder.create().ns('foo');
        ns.type('MyType');
        const fn = () => ns.type('MyType');
        expect(fn).to.throw(/The typename 'MyType' already exists/);
      });

      it('throw: startColumn not valid (eg "A1" rather than "A")', () => {
        const test = (startColumn: string | number) => {
          const ns = TypeBuilder.create().ns('foo');
          const fn = () => ns.type('MyType', { startColumn });
          expect(fn).to.throw();
        };
        test('A1');
        test('1');
        test(-1);
      });
    });
  });

  describe('builder.ns.type.prop', () => {
    it('prop (no param) - default "string"', () => {
      const ns = TypeBuilder.create().ns('foo');
      const type = ns.type('MyType');

      const res = type.prop('foo');
      expect(res.props.length).to.eql(1);

      const prop = res.props[0].toObject();
      expect(prop.name).to.eql('foo');
      expect(prop.type).to.eql('string');
    });

    it('prop (param: string)', () => {
      const ns = TypeBuilder.create().ns('foo');
      const type = ns.type('MyType');

      const res = type
        .prop('foo', 'string')
        .prop('bar', 'number')
        .prop('baz', '"red" | "green"');

      expect(res.props.length).to.eql(3);

      const test = (prop: t.ITypeBuilderProp, name: string, type: string) => {
        const obj = prop.toObject();
        expect(obj.name).to.eql(name);
        expect(obj.type).to.eql(type);
        expect(obj.default).to.eql(undefined);
        expect(obj.target).to.eql(undefined);
      };

      test(res.props[0], 'foo', 'string');
      test(res.props[1], 'bar', 'number');
      test(res.props[2], 'baz', `"red" | "green"`);
    });

    it('prop (param: {options} | fn)', async () => {
      const ns = TypeBuilder.create().ns('foo');
      const type1 = ns.type('Type1');
      const type2 = ns.type('Type2');

      const res1 = type1
        .prop('foo', { type: 'string', target: 'inline:title', default: 'Untitled' })
        .prop('bar', { type: 'number', default: 123 })
        .prop('baz', { type: '"red" | "green"', target: 'inline:baz.color', default: 'red' });

      const res2 = type2
        .prop('foo', prop =>
          prop
            .type('string')
            .default('Untitled')
            .target('inline:title'),
        )
        .prop('bar', prop =>
          prop
            .type('number')
            .default(123)
            .target('ref'),
        )
        .prop('baz', prop =>
          prop
            .type('"red" | "green"')
            .default('red')
            .target('inline:baz.color'),
        );

      expect(res1.props.length).to.eql(3);

      const test = (
        prop: t.ITypeBuilderProp,
        name: string,
        type: string,
        target: any,
        defaultValue: any,
      ) => {
        const obj = prop.toObject();
        expect(obj.name).to.eql(name);
        expect(obj.type).to.eql(type);
        expect(obj.target).to.eql(target);
        expect(obj.default).to.eql(defaultValue);
      };

      test(res1.props[0], 'foo', 'string', 'inline:title', 'Untitled');
      test(res1.props[1], 'bar', 'number', undefined, 123);
      test(res1.props[2], 'baz', '"red" | "green"', 'inline:baz.color', 'red');

      test(res2.props[0], 'foo', 'string', 'inline:title', 'Untitled');
      test(res2.props[1], 'bar', 'number', 'ref', 123);
      test(res2.props[2], 'baz', '"red" | "green"', 'inline:baz.color', 'red');
    });

    describe('column', () => {
      it('starts at column 0 ("A")', () => {
        const type = TypeBuilder.create()
          .ns('foo')
          .type('MyType')
          .prop('title');
        const prop = type.props[0].toObject();
        expect(prop.column).to.eql('A');
      });

      it('starts at column 2 ("C")', () => {
        const ns = TypeBuilder.create().ns('foo');

        const type1 = ns.type('MyType1', { startColumn: 2 }) as TypeBuilderType;
        const type2 = ns.type('MyType2', { startColumn: 'C' }) as TypeBuilderType;
        expect(type1.startColumn).to.eql(2);
        expect(type2.startColumn).to.eql(2);

        const res1 = type1.prop('foo').props[0].toObject();
        const res2 = type2.prop('foo').props[0].toObject();
        expect(res1.column).to.eql('C');
        expect(res2.column).to.eql('C');
      });

      it('auto-increments column', () => {
        const ns = TypeBuilder.create().ns('foo');
        const type = ns
          .type('MyType')
          .prop('foo')
          .prop('bar');
        const props = type.props.map(prop => prop.toObject());
        expect(props[0].column).to.eql('A');
        expect(props[1].column).to.eql('B');
      });

      it('auto-increments column (start offset)', () => {
        const ns = TypeBuilder.create().ns('foo');
        const type = ns
          .type('MyType', { startColumn: 'C' })
          .prop('foo')
          .prop('bar');
        const props = type.props.map(prop => prop.toObject());
        expect(props[0].column).to.eql('C');
        expect(props[1].column).to.eql('D');
      });

      it('explicitly sets column in {options} param', () => {
        const type = TypeBuilder.create()
          .ns('foo')
          .type('MyType')
          .prop('foo1')
          .prop('foo2', { column: 'E' })
          .prop('foo3');
        const columns = type.props.map(prop => prop.toObject().column);
        expect(columns).to.eql(['A', 'E', 'F']);
      });

      it('explicitly sets column in [fn] param', () => {
        const type = TypeBuilder.create()
          .ns('foo')
          .type('MyType')
          .prop('foo1')
          .prop('foo2', prop => prop.column('E'))
          .prop('foo3')
          .prop('foo4', { column: 1 }) // NB: Inserts prior to latest, but does not effect auto-incrementer.
          .prop('foo5');
        const columns = type.props.map(prop => prop.toObject().column);
        expect(columns).to.eql(['A', 'E', 'F', 'B', 'G']);
      });
    });

    describe('errors', () => {
      it('throw: invalid property name', () => {
        const test = (name: string) => {
          const type = TypeBuilder.create()
            .ns('foo')
            .type('MyType');
          const fn = () => type.prop(name);
          expect(fn).to.throw();
        };
        test('foo.1');
        test('foo 1');
        test('1foo');
        test('foo*');
      });

      it('throw: property name already used', () => {
        const type = TypeBuilder.create()
          .ns('foo')
          .type('MyType')
          .prop('foo');

        const fn = () => type.prop(' foo ');
        expect(fn).to.throw(/property named 'foo' has already been added/);
      });

      it('throw: target invalid', () => {
        const test = (target?: string) => {
          const type = TypeBuilder.create()
            .ns('foo')
            .type('MyType');
          const fn = () => type.prop('foo', prop => prop.target(target));
          expect(fn).to.throw();
        };
        test('-');
        test('foobar');
      });

      it('throw: target type (UNKNOWN)', () => {
        const test = (value: string) => {
          const type = TypeBuilder.create()
            .ns('foo')
            .type('MyType');
          const fn = () => type.prop('foo', prop => prop.type(value));
          expect(fn).to.throw();
        };
        test('-');
        test('');
      });

      it('throw: column invalid', () => {
        const test = (value: string | number) => {
          const type = TypeBuilder.create()
            .ns('foo')
            .type('MyType');
          const fn = () => type.prop('foo', prop => prop.column(value));
          expect(fn).to.throw();
        };
        test(-1);
        test('-1');
        test('');
        test('  ');
      });
    });
  });
});
