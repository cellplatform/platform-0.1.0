import { expect, t } from '../test';
import { TypeScript } from '.';

describe('TypeScript', () => {
  describe('TypeScript.primitives', () => {
    it('is immutable', () => {
      const test = (key: keyof t.ITypePrimitives) => {
        const res1 = TypeScript.primitives[key];
        const res2 = TypeScript.primitives[key];
        expect(res1).to.eql(res2);
        expect(res1).to.not.equal(res2);
      };
      test('string');
      test('number');
      test('boolean');
      test('null');
      test('undefined');
    });

    it('type: string', () => {
      const res = TypeScript.primitives.string;
      expect(res.kind).to.eql('VALUE');
      expect(res.typename).to.eql('string');
    });

    it('type: number', () => {
      const res = TypeScript.primitives.number;
      expect(res.kind).to.eql('VALUE');
      expect(res.typename).to.eql('number');
    });

    it('type: boolean', () => {
      const res = TypeScript.primitives.boolean;
      expect(res.kind).to.eql('VALUE');
      expect(res.typename).to.eql('boolean');
    });

    it('type: null', () => {
      const res = TypeScript.primitives.null;
      expect(res.kind).to.eql('VALUE');
      expect(res.typename).to.eql('null');
    });

    it('type: undefined', () => {
      const res = TypeScript.primitives.undefined;
      expect(res.kind).to.eql('VALUE');
      expect(res.typename).to.eql('undefined');
    });
  });

  describe('TypeScript.toDeclaration', () => {
    const { string, boolean } = TypeScript.primitives;

    it('single type (no header)', () => {
      const typename = 'MyFoo';
      const types = [
        { prop: 'name', type: string },
        { prop: 'isEnabled', type: boolean, optional: true },
      ];

      const res = TypeScript.toDeclaration({ typename, types });
      expect(res).to.include(`export declare type MyFoo = {`);
      expect(res).to.include(`name: string;`);
      expect(res).to.include(`isEnabled?: boolean;`);
    });

    it('with header', () => {
      const header = `/**
 * My header
 */`;
      const typename = 'MyFoo';
      const types = [{ prop: 'name', type: string }];
      const res = TypeScript.toDeclaration({ typename, types, header });

      expect(res).to.include(header);
      expect(res).to.include(`export declare type MyFoo = {`);
      expect(res).to.include(`name: string;`);
    });

    it('multiple types (REF)', () => {
      const colorDef: t.ITypeRef = {
        kind: 'REF',
        scope: 'NS',
        uri: 'ns:foo.color',
        typename: 'MyColor',
        types: [
          { prop: 'name', type: string },
          { prop: 'hex', type: string },
        ],
      };

      const types = [
        { prop: 'title', type: string },
        { prop: 'color', type: colorDef, optional: true },
      ];

      const res = TypeScript.toDeclaration({ typename: 'MyOne', types });

      expect(res).to.include(`export declare type MyOne = {`);
      expect(res).to.include(`title: string;`);
      expect(res).to.include(`color?: MyColor;`);

      expect(res).to.include(`export declare type MyColor = {`);
      expect(res).to.include(`name: string;`);
      expect(res).to.include(`hex: string;`);
    });
  });
});
