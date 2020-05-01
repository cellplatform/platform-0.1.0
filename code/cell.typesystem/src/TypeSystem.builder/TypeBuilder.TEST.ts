import { expect, Uri } from '../test';
import { TypeBuilder } from '.';
import { TypeBuilderNs } from './TypeBuilderNs';
import { TypeBuilderType } from './TypeBuilderType';

describe.only('TypeBuilder', () => {
  it('create', () => {
    const builder = TypeBuilder.create();
    expect(builder).to.be.an.instanceof(TypeBuilder);
    expect(builder.toObject()).to.eql({}); // NB: empty.
  });

  describe('ns', () => {
    it('from uri: string', () => {
      const ns = TypeBuilder.create().ns('foo');
      expect(ns).to.be.an.instanceof(TypeBuilderNs);
      expect(ns.uri.toString()).to.eql('ns:foo');
      expect(ns.toObject()).to.eql({ columns: {} }); // NB: empty.
    });

    it('from uri: object', () => {
      const uri = Uri.ns('foo');
      const ns = TypeBuilder.create().ns(uri);
      expect(ns).to.be.an.instanceof(TypeBuilderNs);
      expect(ns.uri.toString()).to.eql('ns:foo');
      expect(ns.toObject()).to.eql({ columns: {} }); // NB: empty.
    });

    describe('type', () => {
      it('typename', () => {
        const ns = TypeBuilder.create().ns('foo');
        const type = ns.type('  MyType  ');
        expect(type).to.be.an.instanceof(TypeBuilderType);
        expect(type.uri.toString()).to.eql('ns:foo');
        expect(type.typename).to.eql('MyType');
      });

      it('startColumn: "A" ➔ 0', () => {
        const test = (startColumn: number | string, expected: number) => {
          const type = TypeBuilder.create()
            .ns('foo')
            .type('MyType', { startColumn });
          expect(type.startColumn).to.eql(expected);
        };
        test('A', 0);
        test('B', 1);
        test(0, 0);
        test(99, 99);
      });

      it('throw: invalid typename', () => {
        const test = (typename: string) => {
          const ns = TypeBuilder.create().ns('foo');
          const fn = () => ns.type(typename);
          expect(fn).to.throw();
        };
        test('foo');
        test('Foo Bar');
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
});
