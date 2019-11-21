import { expect, t } from '../test';
import { value } from '.';

describe('hash', () => {
  describe('hash.cell', () => {
    it('throw if URI not passed', () => {
      expect(() => value.hash.cell({ uri: '' })).to.throw();
      expect(() => value.hash.cell({ uri: '  ' })).to.throw();
      expect(() => value.hash.cell({ uri: 'A1' })).to.throw();
    });

    it('hashes a cell', () => {
      let index = -1;
      const test = (data: {} | undefined, expected: string) => {
        const hash = value.hash.cell({ uri: 'cell:abcd!A1', data });

        index++;
        const err = `\nFail ${index}\n  ${hash}\n  should end with:\n  ${expected}\n\n`;

        expect(hash.startsWith('sha256-')).to.eql(true, err);
        expect(hash.endsWith(expected)).to.eql(true, err);
      };

      test(undefined, '74cbb77a4112ea85f3a3');
      test({ value: undefined }, '74cbb77a4112ea85f3a3');
      test({ value: null }, '74cbb77a4112ea85f3a3');
      test({ value: 123 }, 'd53be0bdbce2a25b2a36');
      test({ value: 'hello' }, 'b3813001a7b30883363c');
      test({ value: 'hello', props: {} }, 'b3813001a7b30883363c');
      test({ value: 'hello', props: { style: { bold: true } } }, 'fab8857189a788c7af8e');
      test({ links: { main: 'ns:abc' } }, '921f26767a2d39629');

      const error: t.IRefErrorCircular = { type: 'REF/circular', path: 'A1/A1', message: 'Fail' };
      test({ value: 'hello', error }, '92a8675656f6818ec330');
    });

    it('same hash for no param AND no cell-value', () => {
      const HASH = 'sha256-77f00fd1a859e597968d1987608778ac197505ea97d174cbb77a4112ea85f3a3';
      const test = (data?: t.ICellData) => {
        const hash = value.hash.cell({ uri: 'cell:abcd!A1', data });
        expect(hash).to.eql(HASH);
      };
      test();
      test(undefined);
      test({ value: undefined });
    });

    it('returns same hash for equivalent props variants', () => {
      const HASH = 'sha256-4b3640ce563efa431406a23c8cb3683e9fe714349f07d5648106e98ac7d1f8e8';
      const test = (props?: {}) => {
        const hash = value.hash.cell({ uri: 'cell:abcd:A1', data: { value: 123, props } });
        // console.log('hash', hash);
        expect(hash).to.eql(HASH);
      };
      test();
      test({});
      test({ style: {} });
      test({ merge: {} });
      test({ style: {}, merge: {} });
    });
  });

  describe('hash.ns', () => {
    it('throws (invalid URI)', () => {
      const ns: t.INs = { id: 'foo' };
      expect(() => value.hash.ns({ uri: '', ns })).to.throw();
      expect(() => value.hash.ns({ uri: '  ', ns })).to.throw();
      expect(() => value.hash.ns({ uri: 'cell:foo!A1', ns })).to.throw();
      expect(() => value.hash.ns({ uri: ' cell:foo!A1  ', ns })).to.throw();
    });

    let index = -1;
    const test = (ns: t.INs, data: Partial<t.INsCoordData> | undefined, expected: string) => {
      const hash = value.hash.ns({ uri: 'ns:foo', ns, data });

      index++;
      const err = `\nFail ${index}\n  ${hash}\n  should end with:\n  ${expected}\n\n`;

      console.log('hash', hash);

      expect(hash.startsWith('sha256-')).to.eql(true, err);
      expect(hash.endsWith(expected)).to.eql(true, err);
    };

    it('no change between different prior {ns.hash} value (it is removed before calc)', () => {
      const HASH = '951a0383ad8';
      test({ id: 'foo', hash: '-' }, undefined, HASH);
      test({ id: 'foo', hash: '' }, undefined, HASH);
      test({ id: 'foo', hash: 'yo' }, undefined, HASH);
      test({ id: 'foo' }, undefined, HASH);
    });

    it.only('no change between undefined/empty data', () => {
      const ns: t.INs = { id: 'foo' };

      const HASH = '951a0383ad8';
      test(ns, undefined, HASH);
      test(ns, {}, HASH);
    });
  });
});
