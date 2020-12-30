import { formatDirs } from './util';
import { expect, fs } from '../../../../test';

describe('Typescript: util', () => {
  describe('formatDirs', () => {
    it('resolve base', () => {
      const res = formatDirs('  types.d  ', '  foo  ');
      expect(res.base).to.eql(fs.resolve('./types.d'));
      expect(res.dirname).to.eql('foo');
      expect(res.join()).to.eql(fs.resolve('./types.d/foo'));
    });

    it('clean "dir" param', () => {
      const test = (dir: string) => {
        const res = formatDirs('  types.d  ', dir);
        expect(res.base).to.eql(fs.resolve('./types.d'));
        expect(res.dirname).to.eql('foo');
        expect(res.join()).to.eql(fs.resolve('./types.d/foo'));
      };
      test('foo');
      test('  foo  ');
      test('//foo//');
      test('  //foo//  ');
      test(fs.resolve('types.d/foo'));
      test(fs.resolve('types.d/foo///'));
      test(`${fs.resolve('types.d/foo')}//`);
    });
  });
});
