import { expect, t, fs } from '../test';
import { value } from '.';

describe('hash', () => {
  describe('hash.ns', () => {
    beforeEach(() => (index = -1));

    let index = -1;
    const test = (ns: t.INs, data: Partial<t.INsDataCoord> | undefined, expected: string) => {
      const hash = value.hash.ns({ uri: 'ns:foo', ns, data });

      index++;
      const err = `\nFail ${index}\n  ${hash}\n  should end with:\n  ${expected}\n\n`;

      expect(hash.startsWith('sha256-')).to.eql(true, err);
      expect(hash.endsWith(expected)).to.eql(true, err);
    };

    it('throws (invalid URI)', () => {
      const ns: t.INs = { id: 'foo' };
      expect(() => value.hash.ns({ uri: '', ns })).to.throw();
      expect(() => value.hash.ns({ uri: '  ', ns })).to.throw();
      expect(() => value.hash.ns({ uri: 'cell:foo!A1', ns })).to.throw();
      expect(() => value.hash.ns({ uri: ' cell:foo!A1  ', ns })).to.throw();
      expect(() => value.hash.ns({ uri: 'row:foo!1', ns })).to.throw();
      expect(() => value.hash.ns({ uri: 'col:foo!A', ns })).to.throw();
      expect(() => value.hash.ns({ uri: 'file:foo.123', ns })).to.throw();
    });

    it('excludes existing hash', () => {
      const HASH = '951a0383ad8';
      test({ id: 'foo', hash: '-' }, undefined, HASH);
      test({ id: 'foo', hash: '' }, undefined, HASH);
      test({ id: 'foo', hash: 'yo' }, undefined, HASH);
      test({ id: 'foo' }, undefined, HASH);
    });

    it('no change between undefined/empty data', () => {
      const HASH = '951a0383ad8';
      const ns: t.INs = { id: 'foo' };
      test(ns, undefined, HASH);
      test(ns, {}, HASH);
    });

    it('child hashes', () => {
      const ns: t.INs = { id: 'foo' };

      // NB: Fake hash values on cell/row/column data.
      //     The `hash.ns` function does not calculate hashes on child data, just
      //     tallies up the child data hashes if they exist.
      //     Make sure to pre-calculate the hashes.

      test(ns, { cells: { A1: { value: 123, hash: 'HASH-A1a' } } }, 'dbdd2ad1de0fe4e279');
      test(ns, { cells: { A1: { value: 124, hash: 'HASH-A1b' } } }, '33138a4244ea71fc');

      test(
        ns,
        {
          cells: { A1: { value: 123, hash: 'HASH-A1' } },
          rows: { 1: { props: { height: 60 }, hash: 'HASH-1' } },
          columns: { A: { props: { width: 250 }, hash: 'HASH-A' } },
        },
        '0a5491bc64dc5d25c932de6',
      );

      test(
        ns,
        {
          cells: { A1: { value: 123 } },
          rows: { 1: { props: { height: 60 } } },
          columns: { A: { props: { width: 250 } } },
        },
        'fc60627f951a0383ad8',
      );
    });
  });

  describe('hash.cell', () => {
    beforeEach(() => (index = -1));

    let index = -1;
    const test = (data: {} | undefined, expected: string) => {
      const hash = value.hash.cell({ uri: 'cell:abcd!A1', data });

      index++;
      const err = `\nFail ${index}\n  ${hash}\n  should end with:\n  ${expected}\n\n`;

      expect(hash.startsWith('sha256-')).to.eql(true, err);
      expect(hash.endsWith(expected)).to.eql(true, err);
    };

    it('throw if URI not passed', () => {
      expect(() => value.hash.cell({ uri: '' })).to.throw();
      expect(() => value.hash.cell({ uri: '  ' })).to.throw();
      expect(() => value.hash.cell({ uri: 'A1' })).to.throw();
    });

    it('hashes a cell', () => {
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

    it('excludes existing hash', () => {
      const HASH = '1a7b30883363c';
      test({ value: 'hello' }, HASH);
      test({ value: 'hello', hash: '-' }, HASH);
      test({ value: 'hello', hash: '' }, HASH);
      test({ value: 'hello', hash: 'yo' }, HASH);
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
        expect(hash).to.eql(HASH);
      };
      test();
      test({});
      test({ style: {} });
      test({ merge: {} });
      test({ style: {}, merge: {} });
    });
  });

  describe('axis: row', () => {
    beforeEach(() => (index = -1));

    let index = -1;
    const test = (data: t.IRowData | undefined, expected: string) => {
      const hash = value.hash.row({ uri: 'row:foo!1', data });

      index++;
      const err = `\nFail ${index}\n  ${hash}\n  should end with:\n  ${expected}\n\n`;

      expect(hash.startsWith('sha256-')).to.eql(true, err);
      expect(hash.endsWith(expected)).to.eql(true, err);
    };

    it('throws (invalid URI)', () => {
      expect(() => value.hash.row({ uri: '' })).to.throw();
      expect(() => value.hash.row({ uri: '  ' })).to.throw();
      expect(() => value.hash.row({ uri: 'ns:foo' })).to.throw();
      expect(() => value.hash.row({ uri: 'cell:foo!A1' })).to.throw();
      expect(() => value.hash.row({ uri: 'col:foo!A' })).to.throw();
      expect(() => value.hash.row({ uri: 'file:foo.123' })).to.throw();
    });

    it('no change between undefined/empty data', () => {
      const EMPTY = 'f1d5f4580';
      test(undefined, EMPTY);
      test({}, EMPTY);

      // NB: Squashed.
      test({ props: {} }, EMPTY);
      test({ error: undefined }, EMPTY);
      test({ props: {}, error: undefined }, EMPTY);
    });

    it('hash props/error', () => {
      test({ props: { height: 123 } }, '6bc2a50012');
      test({ error: { type: 'FAIL', message: 'Bummer' } }, '9276e9a61b2');
      test({ props: { height: 123 }, error: { type: 'FAIL', message: 'Bummer' } }, '489635cc4f');
    });

    it('excludes existing hash', () => {
      const HASH = '814e46bc2a50012';
      test({ props: { height: 123 } }, HASH);
      test({ props: { height: 123 }, hash: '' }, HASH);
      test({ props: { height: 123 }, hash: '-' }, HASH);
      test({ props: { height: 123 }, hash: 'yo' }, HASH);
    });
  });

  describe('axis: column', () => {
    beforeEach(() => (index = -1));

    let index = -1;
    const test = (data: t.IRowData | undefined, expected: string) => {
      const hash = value.hash.column({ uri: 'col:foo!1', data });

      index++;
      const err = `\nFail ${index}\n  ${hash}\n  should end with:\n  ${expected}\n\n`;

      expect(hash.startsWith('sha256-')).to.eql(true, err);
      expect(hash.endsWith(expected)).to.eql(true, err);
    };

    it('throws (invalid URI)', () => {
      expect(() => value.hash.column({ uri: '' })).to.throw();
      expect(() => value.hash.column({ uri: '  ' })).to.throw();
      expect(() => value.hash.column({ uri: 'ns:foo' })).to.throw();
      expect(() => value.hash.column({ uri: 'cell:foo!A1' })).to.throw();
      expect(() => value.hash.column({ uri: 'row:foo!1' })).to.throw();
      expect(() => value.hash.column({ uri: 'file:foo.123' })).to.throw();
    });

    it('no change between undefined/empty data', () => {
      const EMPTY = '60e123db802f7a5';
      test(undefined, EMPTY);
      test({}, EMPTY);

      // NB: Squashed.
      test({ props: {} }, EMPTY);
      test({ error: undefined }, EMPTY);
      test({ props: {}, error: undefined }, EMPTY);
    });

    it('hash props/error', () => {
      test({ props: { width: 250 } }, '32bf0eac44b45945');
      test({ error: { type: 'FAIL', message: 'Bummer' } }, 'd5ca634bfddae2');
      test({ props: { width: 250 }, error: { type: 'FAIL', message: 'Bummer' } }, 'ea2465e6bacf97');
    });

    it('excludes existing hash', () => {
      const HASH = 'f0eac44b45945';
      test({ props: { width: 250 } }, HASH);
      test({ props: { width: 250 }, hash: '' }, HASH);
      test({ props: { width: 250 }, hash: '-' }, HASH);
      test({ props: { width: 250 }, hash: 'yo' }, HASH);
    });
  });

  describe('file', () => {
    beforeEach(() => (index = -1));

    let index = -1;
    const test = (data: t.IFileData | undefined, expected: string) => {
      const hash = value.hash.file({ uri: 'file:foo.123', data });

      index++;
      const err = `\nFail ${index}\n  ${hash}\n  should end with:\n  ${expected}\n\n`;

      expect(hash.startsWith('sha256-')).to.eql(true, err);
      expect(hash.endsWith(expected)).to.eql(true, err);
    };

    it('throws (invalid URI)', async () => {
      const invalid = (uri: string) => {
        expect(() => value.hash.file({ uri })).to.throw();
      };
      invalid('');
      invalid('  ');
      invalid('ns:foo');
      invalid('cell:foo!A1');
      invalid('col:foo!A');
      invalid('row:foo!1');
    });

    it('hash props/error/buffer', async () => {
      const jpg = await fs.readFile(fs.resolve('src/test/images/kitten.jpg'));
      const fileHash = value.hash.sha256(jpg);
      const error = { type: 'FAIL', message: 'Bummer' };

      test({ props: { name: 'image.png' } }, 'e2e43515c3');
      test({ props: { name: 'image.png', fileHash } }, '34ccb871c4');
      test({ props: { name: 'image.png', mimetype: 'image/png', fileHash } }, '584f44d68e');
      test({ props: {}, error }, 'b97a3f147a');
      test({ props: { name: 'image.png', fileHash }, error }, 'ab36528007');
    });
  });
});
