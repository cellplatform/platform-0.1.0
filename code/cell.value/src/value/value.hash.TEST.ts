import { value } from '.';
import { expect, t } from '../test';

const INTEGRITY: t.IFileIntegrity = {
  status: 'VALID',
  filehash: 'sha256-abc',
  uploadedAt: 123456789,
  's3:etag': 'abcd-12345',
};

type R = t.IRowProps & { grid?: { height?: number } };
type C = t.IColumnProps & { grid?: { width?: number } };

describe('hash', () => {
  describe('hash.ns', () => {
    beforeEach(() => (index = -1));

    let index = -1;
    const test = (expected: string, ns: t.INs) => {
      const hash = value.hash.ns({ uri: 'ns:foo', ns });

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
      expect(() => value.hash.ns({ uri: '  cell:foo!A1  ', ns })).to.throw();
      expect(() => value.hash.ns({ uri: 'cell:foo!1', ns })).to.throw();
      expect(() => value.hash.ns({ uri: 'cell:foo!A', ns })).to.throw();
      expect(() => value.hash.ns({ uri: 'file:foo.123', ns })).to.throw();
    });

    it('excludes existing hash', () => {
      const HASH = 'b3ba839bac';
      test(HASH, { id: 'foo', hash: '-' });
      test(HASH, { id: 'foo', hash: '' });
      test(HASH, { id: 'foo', hash: 'yo' });
      test(HASH, { id: 'foo' });
    });

    it('no change between undefined/empty data', () => {
      const HASH = 'b3ba839bac';
      const ns: t.INs = { id: 'foo' };
      test(HASH, ns);
      test(HASH, ns);
    });
  });

  describe('hash.cell', () => {
    beforeEach(() => {
      index = -1;
    });

    let index = -1;
    const test = (expected: string, data: {} | undefined) => {
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
      test('12ea85f3a3', undefined);
      test('12ea85f3a3', { value: undefined });
      test('12ea85f3a3', { value: null });
      test('e2a25b2a36', { value: 123 });
      test('b30883363c', { value: 'hello' });
      test('b30883363c', { value: 'hello', props: {} });
      test('a788c7af8e', { value: 'hello', props: { style: { bold: true } } });
      test('67a2d39629', { links: { main: 'ns:abc' } });
      const error: t.IRefErrorCircular = { type: 'REF/circular', path: 'A1/A1', message: 'Fail' };
      test('f6818ec330', { value: 'hello', error });
    });

    it('excludes existing hash', () => {
      const HASH = 'b30883363c';
      test(HASH, { value: 'hello' });
      test(HASH, { value: 'hello', hash: '-' });
      test(HASH, { value: 'hello', hash: '' });
      test(HASH, { value: 'hello', hash: 'yo' });
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
    const test = (expected: string, data: t.IRowData<R> | undefined) => {
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
      test(EMPTY, undefined);
      test(EMPTY, {});

      // NB: Squashed.
      test(EMPTY, { props: {} });
      test(EMPTY, { error: undefined });
      test(EMPTY, { props: {}, error: undefined });
    });

    it('hash props/error', () => {
      test('fa5a89cc0f', { props: { grid: { height: 123 } } });
      test('70ca03a602', { error: { type: 'FAIL', message: 'Bummer' } });
      test('e5cb40c02f', {
        props: { grid: { height: 123 } },
        error: { type: 'FAIL', message: 'Bummer' },
      });
    });

    it('excludes existing hash', () => {
      const HASH = 'fa5a89cc0f';
      test(HASH, { props: { grid: { height: 123 } } });
      test(HASH, { props: { grid: { height: 123 } }, hash: '' });
      test(HASH, { props: { grid: { height: 123 } }, hash: '-' });
      test(HASH, { props: { grid: { height: 123 } }, hash: 'yo' });
    });
  });

  describe('axis: column', () => {
    beforeEach(() => (index = -1));

    let index = -1;
    const test = (expected: string, data: t.IColumnData<C> | undefined) => {
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
      test(EMPTY, undefined);
      test(EMPTY, {});

      // NB: Squashed.
      test(EMPTY, { props: {} });
      test(EMPTY, { error: undefined });
      test(EMPTY, { props: {}, error: undefined });
    });

    it('hash props/error', () => {
      test('969c76ece5', { props: { grid: { width: 250 } } });
      test('13959c04f8', { error: { type: 'FAIL', message: 'Bummer' } });
      test('c6469bbf42', {
        props: { grid: { width: 250 } },
        error: { type: 'FAIL', message: 'Bummer' },
      });
    });

    it('excludes existing hash', () => {
      const HASH = '969c76ece5';
      test(HASH, { props: { grid: { width: 250 } } });
      test(HASH, { props: { grid: { width: 250 } }, hash: '' });
      test(HASH, { props: { grid: { width: 250 } }, hash: '-' });
      test(HASH, { props: { grid: { width: 250 } }, hash: 'yo' });
    });
  });

  describe('file', () => {
    beforeEach(() => (index = -1));

    let index = -1;
    const test = (data: t.IFileData | undefined, expected: string) => {
      const hash = value.hash.file({ uri: 'file:foo:123', data });
      // return console.log(hash.substring(hash.length - 10));

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
      const error = { type: 'FAIL', message: 'Bummer' };
      const integrity = INTEGRITY;

      test({ props: {} }, 'ca6edf2f56');
      test({ props: { integrity } }, '628532e6a7');
      test({ props: { mimetype: 'image/png', integrity } }, '38d6e3ca08');
      test({ props: {}, error }, '1fd68d1131');
      test({ props: { integrity }, error }, '94153af4ab');
    });
  });
});
