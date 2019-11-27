import { expect, t } from '../test';
import { Uri } from './Uri';

describe('Uri', () => {
  describe('ids', () => {
    it('Uri.cuid', () => {
      const res = Uri.cuid();
      expect(res.length).to.greaterThan(15);
    });

    it('Uri.slug', () => {
      const res = Uri.slug();
      expect(res.length).to.eql(8);
    });
  });

  describe('is', () => {
    it('is.uri', () => {
      const test = (input?: string, expected?: boolean) => {
        expect(Uri.is.uri(input)).to.eql(expected);
      };

      test('ns:abcd', true);
      test('cell:abcd!A1', true);
      test('row:abcd!1', true);
      test('col:abcd!A', true);
      test('file:abcd.123', true);

      test(undefined, false);
      test('', false);
      test('ns:', false);
      test('row:', false);
      test('col:', false);
      test('cell:', false);
      test('file:', false);
      test('cell:abcd', false);
      test('row:abcd', false);
      test('col:abcd', false);
      test('file:abcd', false);
      test('file:abcd:123', false);
      test('file:abcd-123', false);
    });

    it('is.type', () => {
      const test = (type: t.UriType, input?: string, expected?: boolean) => {
        expect(Uri.is.type(type, input)).to.eql(expected, `${type} | input: ${input}`);
      };

      test('ns', 'ns:abcd', true);
      test('cell', 'cell:abcd!A1', true);
      test('col', 'col:abcd!A', true);
      test('row', 'row:abcd!1', true);
      test('file', 'file:abc.123', true);
      test('UNKNOWN', 'foo:bar!1', true);

      test('ns', undefined, false);
      test('cell', undefined, false);
      test('col', undefined, false);
      test('row', undefined, false);
      test('file', undefined, false);

      test('ns', '', false);
      test('cell', '', false);
      test('col', '', false);
      test('row', '', false);
      test('file', '', false);
    });

    it('is.ns', () => {
      const test = (input?: string, expected?: boolean) => {
        expect(Uri.is.ns(input)).to.eql(expected);
      };
      test('ns:abcd', true);
      test('', false);
      test(undefined, false);
    });

    it('is.file', () => {
      const test = (input?: string, expected?: boolean) => {
        expect(Uri.is.file(input)).to.eql(expected);
      };
      test('file:abcd.123', true);
      test('file:abcd', false);
      test('ns:abcd', false);
      test('', false);
      test(undefined, false);
    });

    it('is.cell', () => {
      const test = (input?: string, expected?: boolean) => {
        expect(Uri.is.cell(input)).to.eql(expected);
      };
      test('cell:abcd!A1', true);
      test('', false);
      test(undefined, false);
      test('ns:abcd', false);
      test('col:abcd!A', false);
    });

    it('is.row', () => {
      const test = (input?: string, expected?: boolean) => {
        expect(Uri.is.row(input)).to.eql(expected);
      };
      test('row:abcd!1', true);
      test('', false);
      test(undefined, false);
      test('ns:abcd', false);
      test('col:abcd!A', false);
    });

    it('is.column', () => {
      const test = (input?: string, expected?: boolean) => {
        expect(Uri.is.column(input)).to.eql(expected);
      };
      test('col:abcd!A', true);
      test('', false);
      test(undefined, false);
      test('ns:abcd', false);
      test('row:abcd!1', false);
    });
  });

  describe('parse', () => {
    it('ns', () => {
      const res = Uri.parse<t.INsUri>('ns:abcd');
      expect(res.ok).to.eql(true);
      expect(res.error).to.eql(undefined);
      expect(res.parts.type).to.eql('ns');
      expect(res.parts.id).to.eql('abcd');
      expect(res.uri).to.eql('ns:abcd');
      expect(res.toString()).to.eql(res.uri);
    });

    it('cell', () => {
      const res = Uri.parse<t.ICellUri>('cell:abc!A1');
      expect(res.ok).to.eql(true);
      expect(res.error).to.eql(undefined);
      expect(res.parts.type).to.eql('cell');
      expect(res.parts.id).to.eql('abc!A1');
      expect(res.parts.ns).to.eql('abc');
      expect(res.parts.key).to.eql('A1');
      expect(res.uri).to.eql('cell:abc!A1');
      expect(res.toString()).to.eql(res.uri);
    });

    it('row', () => {
      const res = Uri.parse<t.IRowUri>('row:abc!1');
      expect(res.ok).to.eql(true);
      expect(res.error).to.eql(undefined);
      expect(res.parts.type).to.eql('row');
      expect(res.parts.id).to.eql('abc!1');
      expect(res.parts.ns).to.eql('abc');
      expect(res.parts.key).to.eql('1');
      expect(res.uri).to.eql('row:abc!1');
      expect(res.toString()).to.eql(res.uri);
    });

    it('col', () => {
      const res = Uri.parse<t.IColumnUri>('col:abc!A');
      expect(res.ok).to.eql(true);
      expect(res.error).to.eql(undefined);
      expect(res.parts.type).to.eql('col');
      expect(res.parts.id).to.eql('abc!A');
      expect(res.parts.ns).to.eql('abc');
      expect(res.parts.key).to.eql('A');
      expect(res.uri).to.eql('col:abc!A');
      expect(res.toString()).to.eql(res.uri);
    });

    it('file', () => {
      const res = Uri.parse<t.IFileUri>('file:abc.123');
      expect(res.ok).to.eql(true);
      expect(res.error).to.eql(undefined);
      expect(res.parts.type).to.eql('file');
      expect(res.parts.id).to.eql('abc.123');
      expect(res.parts.ns).to.eql('abc');
      expect(res.parts.file).to.eql('123');
      expect(res.uri).to.eql('file:abc.123');
      expect(res.toString()).to.eql(res.uri);
    });

    describe('error', () => {
      it('error: UNKNOWN', () => {
        const test = (input: string | undefined) => {
          const res = Uri.parse(input);
          expect(res.ok).to.eql(false);
          expect(res.parts.type).to.eql('UNKNOWN');
          expect(res.uri).to.eql((input || '').trim());
          expect(res.error && res.error.message).to.contain('URI not specified');
        };
        test(undefined);
        test('');
        test('   ');
      });

      it('no ":" seperated parts', () => {
        const res = Uri.parse('foo');
        expect(res.ok).to.eql(false);
        expect(res.error && res.error.message).to.contain('Not a valid multi-part URI');
      });

      it('ns: no ID', () => {
        const test = (input?: string) => {
          const res = Uri.parse<t.INsUri>(input);
          expect(res.ok).to.eql(false);
          expect(res.error && res.error.message).to.contain('Namespace URI identifier not found');
        };
        test('ns:');
        test('ns: ');
      });

      it('coord: no namespace', () => {
        const test = (input: string, field: string) => {
          const res = Uri.parse<t.ICellUri>(input);
          expect(res.ok).to.eql(false);
          expect(res.error && res.error.message).to.contain(`ID of '${field}' not found`);
        };
        test('cell:', 'cell');
        test('row:', 'row');
        test('col:', 'col');
      });

      it('coord: no key', () => {
        const test = (input: string, field: string) => {
          const res = Uri.parse<t.ICellUri>(input);
          expect(res.ok).to.eql(false);
          expect(res.error && res.error.message).to.contain(`URI does not contain a "!" character`);
          expect(res.parts.key).to.eql('');
          expect(res.parts.ns).to.eql('');
        };
        test('cell:abcd', 'cell');
        test('row:abcd', 'row');
        test('col:abcd', 'col');
      });

      it('file', () => {
        const test = (input: string, error: string) => {
          const res = Uri.parse<t.IFileUri>(input);
          expect(res.ok).to.eql(false);
          expect(res.error && res.error.message).to.contain(error);
        };
        test('file:', 'File URI identifier not found');
        test('  file:  ', 'File URI identifier not found');
        test('file:foo', 'File identifier within namespace "foo" not found');
      });
    });
  });

  describe('string', () => {
    it('ns', () => {
      const test = (id: string, expected: string) => {
        const res = Uri.string.ns(id);
        expect(res).to.eql(expected);
      };
      test('foo', 'ns:foo');
      test('ns:foo', 'ns:foo');
      test(' ns::foo ', 'ns:foo');
      test('ns', 'ns:ns');
    });

    it('file', () => {
      const test = (ns: string, file: string, expected: string) => {
        const res = Uri.string.file(ns, file);
        expect(res).to.eql(expected);
      };
      test('foo', '123', 'file:foo.123');
      test(' foo ', ' 123 ', 'file:foo.123');
      test('file:foo', '123', 'file:foo.123');
    });

    it('cell', () => {
      const test = (ns: string, key: string, expected: string) => {
        const res = Uri.string.cell(ns, key);
        expect(res).to.eql(expected);
      };
      test('foo', 'A1', 'cell:foo!A1');
      test('foo', '!A1', 'cell:foo!A1');
      test('foo', '!!A1', 'cell:foo!A1');
    });

    it('row', () => {
      const test = (ns: string, key: string, expected: string) => {
        const res = Uri.string.row(ns, key);
        expect(res).to.eql(expected);
      };
      test('foo', '1', 'row:foo!1');
      test('foo', '!1', 'row:foo!1');
      test('foo', '!!1', 'row:foo!1');
    });

    it('column', () => {
      const test = (ns: string, key: string, expected: string) => {
        const res = Uri.string.column(ns, key);
        expect(res).to.eql(expected);
      };
      test('foo', 'A', 'col:foo!A');
      test('foo', '!A', 'col:foo!A');
      test('foo', '!!A', 'col:foo!A');
    });

    const ILLEGAL = {
      NS: '~`!@#$%^&*()_-+=,./?;|[]{}',
    };

    it('throws: ns', () => {
      expect(() => Uri.string.ns(':')).to.throw();
      expect(() => Uri.string.ns('ns:')).to.throw();
      expect(() => Uri.string.ns('  ns:  ')).to.throw();

      // Illegal characters.
      ILLEGAL.NS.split('').forEach(char => {
        const id = `ns:abc${char}def`;
        expect(() => Uri.string.ns(id)).to.throw();
      });
    });

    it('throws: file', () => {
      expect(() => Uri.string.file(':', 'fileid')).to.throw();
      expect(() => Uri.string.file('ns:', 'fileid')).to.throw();
      expect(() => Uri.string.file('  ns:  ', 'fileid')).to.throw();

      // Illegal namespace characters.
      ILLEGAL.NS.split('').forEach(char => {
        const ns = `ns:abc${char}def`;
        expect(() => Uri.string.file(ns, 'fileid')).to.throw();
      });

      // Illegal file-id characters.
      ILLEGAL.NS.split('').forEach(char => {
        const file = `abc${char}def`;
        expect(() => Uri.string.file('foo', file)).to.throw();
      });
    });

    it('throws: cell', () => {
      expect(() => Uri.string.cell('', 'A1')).to.throw();
      expect(() => Uri.string.cell('foo', '')).to.throw();
      expect(() => Uri.string.cell('foo', '!')).to.throw();
      expect(() => Uri.string.cell('foo', 'A')).to.throw();
      expect(() => Uri.string.cell('foo', '1')).to.throw();
    });

    it('throws: column', () => {
      expect(() => Uri.string.column('', 'A')).to.throw();
      expect(() => Uri.string.column('foo', '')).to.throw();
      expect(() => Uri.string.column('foo', '!')).to.throw();
      expect(() => Uri.string.column('foo', 'A1')).to.throw();
      expect(() => Uri.string.column('foo', '1')).to.throw();
    });

    it('throws: row', () => {
      expect(() => Uri.string.row('', '1')).to.throw();
      expect(() => Uri.string.row('foo', '')).to.throw();
      expect(() => Uri.string.row('foo', '!')).to.throw();
      expect(() => Uri.string.row('foo', 'A1')).to.throw();
      expect(() => Uri.string.row('foo', 'A')).to.throw();
    });
  });
});
