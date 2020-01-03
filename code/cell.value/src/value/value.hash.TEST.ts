import { expect, t, fs, Uri } from '../test';
import { value } from '.';

describe('hash', () => {
  describe('hash.ns', () => {
    beforeEach(() => (index = -1));

    let index = -1;
    const test = (ns: t.INs, data: Partial<t.INsDataCoord> | undefined, expected: string) => {
      const hash = value.hash.ns({ uri: 'ns:foo', ns, data });

      index++;
      const err = `\nFail ${index}\n  ${hash}\n  should end with:\n  ${expected}\n\n`;

      // console.log('hash', hash.substring(hash.length - 10));

      expect(hash.startsWith('sha256-')).to.eql(true, err);
      expect(hash.endsWith(expected)).to.eql(true, err);
    };

    it('throws (invalid URI)', () => {
      const ns: t.INs = { id: 'foo' };
      expect(() => value.hash.ns({ uri: '', ns })).to.throw();
      expect(() => value.hash.ns({ uri: '  ', ns })).to.throw();
      expect(() => value.hash.ns({ uri: 'cell:foo!A1', ns })).to.throw();
      expect(() => value.hash.ns({ uri: ' cell:foo!A1  ', ns })).to.throw();
      expect(() => value.hash.ns({ uri: 'cell:foo!1', ns })).to.throw();
      expect(() => value.hash.ns({ uri: 'cell:foo!A', ns })).to.throw();
      expect(() => value.hash.ns({ uri: 'file:foo.123', ns })).to.throw();
    });

    it('excludes existing hash', () => {
      const HASH = '51a0383ad8';
      test({ id: 'foo', hash: '-' }, undefined, HASH);
      test({ id: 'foo', hash: '' }, undefined, HASH);
      test({ id: 'foo', hash: 'yo' }, undefined, HASH);
      test({ id: 'foo' }, undefined, HASH);
    });

    it('no change between undefined/empty data', () => {
      const HASH = '51a0383ad8';
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

      test(ns, { cells: { A1: { value: 123, hash: 'HASH-A1a' } } }, 'de0fe4e279');
      test(ns, { cells: { A1: { value: 124, hash: 'HASH-A1b' } } }, '4244ea71fc');

      test(
        ns,
        {
          cells: { A1: { value: 123, hash: 'HASH-A1' } },
          rows: { 1: { props: { height: 60 }, hash: 'HASH-1' } },
          columns: { A: { props: { width: 250 }, hash: 'HASH-A' } },
        },
        'd25c932de6',
      );

      test(
        ns,
        {
          cells: { A1: { value: 123 } },
          rows: { 1: { props: { height: 60 } } },
          columns: { A: { props: { width: 250 } } },
        },
        '51a0383ad8',
      );
    });
  });

  describe('hash.cell', () => {
    beforeEach(() => {
      index = -1;
    });

    let index = -1;
    const test = (data: {} | undefined, expected: string) => {
      const hash = value.hash.cell({ uri: 'cell:abcd!A1', data });

      index++;
      const err = `\nFail ${index}\n  ${hash}\n  should end with:\n  ${expected}\n\n`;

      // console.log('hash', hash.substring(hash.length - 10));

      expect(hash.startsWith('sha256-')).to.eql(true, err);
      expect(hash.endsWith(expected)).to.eql(true, err);
    };

    it('throw if URI not passed', () => {
      expect(() => value.hash.cell({ uri: '' })).to.throw();
      expect(() => value.hash.cell({ uri: '  ' })).to.throw();
      expect(() => value.hash.cell({ uri: 'A1' })).to.throw();
    });

    it('hashes a cell', () => {
      test(undefined, '12ea85f3a3');
      test({ value: undefined }, '12ea85f3a3');
      test({ value: null }, '12ea85f3a3');
      test({ value: 123 }, 'e2a25b2a36');
      test({ value: 'hello' }, 'b30883363c');
      test({ value: 'hello', props: {} }, 'b30883363c');
      test({ value: 'hello', props: { style: { bold: true } } }, 'a788c7af8e');
      test({ links: { main: 'ns:abc' } }, '67a2d39629');
      const error: t.IRefErrorCircular = { type: 'REF/circular', path: 'A1/A1', message: 'Fail' };
      test({ value: 'hello', error }, 'f6818ec330');
    });

    it('excludes existing hash', () => {
      const HASH = 'b30883363c';
      test({ value: 'hello' }, HASH);
      test({ value: 'hello', hash: '-' }, HASH);
      test({ value: 'hello', hash: '' }, HASH);
      test({ value: 'hello', hash: 'yo' }, HASH);
    });

    it('same hash for no param AND no cell-value', () => {
      const HASH = '12ea85f3a3';
      const test = (data?: t.ICellData) => {
        const hash = value.hash.cell({ uri: 'cell:abcd!A1', data });

        // console.log('hash', hash.substring(hash.length - 10));

        expect(hash.startsWith('sha256-')).to.eql(true);
        expect(hash.endsWith(HASH)).to.eql(true);
      };
      test();
      test(undefined);
      test({ value: undefined });
    });

    it('returns same hash for equivalent props variants', () => {
      const HASH = 'e2a25b2a36';
      const test = (props?: {}) => {
        const hash = value.hash.cell({ uri: 'cell:abcd!A1', data: { value: 123, props } });

        // console.log('hash', hash.substring(hash.length - 10));

        expect(hash.startsWith('sha256-')).to.eql(true);
        expect(hash.endsWith(HASH)).to.eql(true);
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
      const hash = value.hash.row({ uri: 'cell:foo!1', data });

      index++;
      const err = `\nFail ${index}\n  ${hash}\n  should end with:\n  ${expected}\n\n`;

      // console.log('hash', hash.substring(hash.length - 10));

      expect(hash.startsWith('sha256-')).to.eql(true, err);
      expect(hash.endsWith(expected)).to.eql(true, err);
    };

    it('throws (invalid URI)', () => {
      expect(() => value.hash.row({ uri: '' })).to.throw();
      expect(() => value.hash.row({ uri: '  ' })).to.throw();
      expect(() => value.hash.row({ uri: 'ns:foo' })).to.throw();
      expect(() => value.hash.row({ uri: 'cell:foo!A1' })).to.throw();
      expect(() => value.hash.row({ uri: 'cell:foo!A' })).to.throw();
      expect(() => value.hash.row({ uri: 'file:foo.123' })).to.throw();
    });

    it('no change between undefined/empty data', () => {
      const EMPTY = '356cc0bfc9';
      test(undefined, EMPTY);
      test({}, EMPTY);

      // NB: Squashed.
      test({ props: {} }, EMPTY);
      test({ error: undefined }, EMPTY);
      test({ props: {}, error: undefined }, EMPTY);
    });

    it('hash props/error', () => {
      test({ props: { height: 123 } }, 'd35daa3855');
      test({ error: { type: 'FAIL', message: 'Bummer' } }, '70ca03a602');
      test({ props: { height: 123 }, error: { type: 'FAIL', message: 'Bummer' } }, '706cd0c7cc');
    });

    it('excludes existing hash', () => {
      const HASH = 'd35daa3855';
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
      const hash = value.hash.column({ uri: 'cell:foo!A', data });

      index++;
      const err = `\nFail ${index}\n  ${hash}\n  should end with:\n  ${expected}\n\n`;

      // console.log('hash', hash.substring(hash.length - 10));

      expect(hash.startsWith('sha256-')).to.eql(true, err);
      expect(hash.endsWith(expected)).to.eql(true, err);
    };

    it('throws (invalid URI)', () => {
      expect(() => value.hash.column({ uri: '' })).to.throw();
      expect(() => value.hash.column({ uri: '  ' })).to.throw();
      expect(() => value.hash.column({ uri: 'ns:foo' })).to.throw();
      expect(() => value.hash.column({ uri: 'cell:foo!A1' })).to.throw();
      expect(() => value.hash.column({ uri: 'cell:foo!1' })).to.throw();
      expect(() => value.hash.column({ uri: 'file:foo.123' })).to.throw();
    });

    it('no change between undefined/empty data', () => {
      const EMPTY = '1311449838';
      test(undefined, EMPTY);
      test({}, EMPTY);

      // NB: Squashed.
      test({ props: {} }, EMPTY);
      test({ error: undefined }, EMPTY);
      test({ props: {}, error: undefined }, EMPTY);
    });

    it('hash props/error', () => {
      test({ props: { width: 250 } }, '92b6c98c59');
      test({ error: { type: 'FAIL', message: 'Bummer' } }, '13959c04f8');
      test({ props: { width: 250 }, error: { type: 'FAIL', message: 'Bummer' } }, 'd7cad6af36');
    });

    it('excludes existing hash', () => {
      const HASH = '92b6c98c59';
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
      const hash = value.hash.file({ uri: 'file:foo:123', data });

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
      invalid('cell:foo!A');
      invalid('cell:foo!1');
    });

    it('hash props/error/buffer', async () => {
      const jpg = await fs.readFile(fs.resolve('src/test/images/kitten.jpg'));
      const filehash = value.hash.sha256(jpg);
      const error = { type: 'FAIL', message: 'Bummer' };

      test({ props: { filename: 'image.png' } }, 'c260743951');
      test({ props: { filename: 'image.png', filehash } }, '495d42fd62');
      test({ props: { filename: 'image.png', mimetype: 'image/png', filehash } }, 'de247e4b74');
      test({ props: {}, error }, '1fd68d1131');
      test({ props: { filename: 'image.png', filehash }, error }, 'b1500cf16c');
    });
  });
});
