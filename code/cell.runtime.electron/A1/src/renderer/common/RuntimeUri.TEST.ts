import { expect } from '../../test';
import { RuntimeUri } from './RuntimeUri';

describe('Uri', () => {
  describe('is', () => {
    it('is.main', () => {
      const test = (input: any, expected: boolean) => {
        expect(RuntimeUri.is.main(input)).to.eql(expected);
      };

      test('', false);
      test('  ', false);
      test({}, false);
      test('process : main', false);

      test('process:main', true);
      test('  process:main  ', true);
    });

    it('is.window', () => {
      const test = (input: any, expected: boolean) => {
        expect(RuntimeUri.is.window(input)).to.eql(expected);
      };

      test('', false);
      test('  ', false);
      test({}, false);
      test('process : window:1', false);
      test('process:window', false);

      test('process:window:1', true);
      test(' process:window:2  ', true);
    });
  });

  describe('main', () => {
    it('constant', () => {
      expect(RuntimeUri.main).to.eql('process:main');
    });
  });

  describe('window', () => {
    describe('create', () => {
      it('with number', () => {
        const res = RuntimeUri.window.create(1);
        expect(res).to.eql('process:window:1');
      });

      it('with slug', () => {
        const res = RuntimeUri.window.create('abcd');
        expect(res).to.eql('process:window:abcd');
      });

      it('generated slug', () => {
        const res = RuntimeUri.window.create();
        const slug = res.split(':')[2];
        expect(res.startsWith('process:window')).to.eql(true);
        expect(typeof slug === 'string').to.eql(true);
        expect(slug.length > 3).to.eql(true);
      });
    });

    describe('parse', () => {
      it('success', () => {
        const res = RuntimeUri.window.parse('  process:window:abc ');
        expect(res?.ok).to.eql(true);
        expect(res?.type).to.eql('window');
        expect(res?.slug).to.eql('abc');
        expect(res?.errors).to.eql([]);
      });

      it('fail: no match (undefined)', () => {
        const test = (input: any) => {
          expect(RuntimeUri.window.parse(input)).to.eql(undefined);
        };
        test('');
        test('foobar');
        test('cell:ns:A1');
        test('process:window'); // NB: not actually a fully-qualified window URI.
        test(undefined);
        test(null);
        test({ foo: 123 });
        test([1, 2, 3]);
        test(123);
      });

      it('error: invalid id', () => {
        const res = RuntimeUri.window.parse('process:window:');
        expect(res?.ok).to.eql(false);
        expect(res?.errors.length).to.eql(1);
        expect(res?.errors[0]).to.include('Not a valid id (slug)');
      });
    });
  });
});
