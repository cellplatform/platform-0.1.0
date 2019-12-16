import { expect, t, cuid } from '../test';
import { Uri } from '.';
import { TEST } from './Uri';

describe('Uri', () => {
  describe('ids', () => {
    it('Uri.cuid', () => {
      const res = Uri.cuid();
      expect(res.length).to.greaterThan(15);
    });

    it('Uri.slug', () => {
      const res = Uri.slug();
      expect(res.length).to.within(5, 10);
    });

    it('test identifiers (ns)', () => {
      TEST.NS.ALLOW.forEach(id => {
        const uri1 = Uri.create.ns(id);
        const uri2 = Uri.parse<t.INsUri>(`ns:${id}`);
        expect(uri1).to.eql(`ns:${id}`);
        expect(uri2.ok).to.eql(true);
      });
    });
  });

  describe('is', () => {
    it('is.uri', () => {
      const test = (input?: string, expected?: boolean) => {
        expect(Uri.is.uri(input)).to.eql(expected, input);
      };

      // Valid.
      test('ns:foo', true);
      test('cell:foo!A1', true);
      test('cell:foo!1', true);
      test('cell:foo!A', true);
      test('file:foo:123', true);

      // Empty.
      test(undefined, false);
      test(null as any, false);
      test('', false);
      test('  ', false);

      // Prefix match, but invalid.
      test('ns:', false);
      test('cell:', false);
      test('file:', false);
      test('cell:foo', false);
      test('file:foo', false);
      test('file:foo.123', false);
      test('file:foo-123', false);

      // Not a prefix match.
      test('boo:foo', false);
      test('row:', false);
      test('col:', false);
    });

    it('is.type', () => {
      const test = (type: t.UriType, input?: string, expected?: boolean) => {
        expect(Uri.is.type(type, input)).to.eql(expected, `${type} | input: ${input}`);
      };

      test('NS', 'ns:foo', true);
      test('CELL', 'cell:foo!A1', true);
      test('COLUMN', 'cell:foo!A', true);
      test('ROW', 'cell:foo!1', true);
      test('FILE', 'file:foo:123', true);
      test('UNKNOWN', 'foo:bar!1', true);

      test('NS', undefined, false);
      test('CELL', undefined, false);
      test('COLUMN', undefined, false);
      test('ROW', undefined, false);
      test('FILE', undefined, false);

      test('NS', '', false);
      test('CELL', '', false);
      test('COLUMN', '', false);
      test('ROW', '', false);
      test('FILE', '', false);
    });

    it('is.ns', () => {
      const test = (input?: string, expected?: boolean) => {
        expect(Uri.is.ns(input)).to.eql(expected);
      };
      test('ns:foo', true);

      test('', false);
      test(undefined, false);
      test('cell:foo!A1', false);
      test('cell:foo!1', false);
      test('cell:foo!A', false);
    });

    it('is.file', () => {
      const test = (input?: string, expected?: boolean) => {
        expect(Uri.is.file(input)).to.eql(expected);
      };
      test('file:foo:123', true);

      test('file:foo', false);
      test('ns:foo', false);
      test('', false);
      test(undefined, false);
    });

    it('is.cell', () => {
      const test = (input?: string, expected?: boolean) => {
        expect(Uri.is.cell(input)).to.eql(expected);
      };
      test('cell:foo!A1', true);

      test('', false);
      test(undefined, false);
      test('ns:foo', false);
      test('col:foo!A', false);
    });

    it('is.row', () => {
      const test = (input?: string, expected?: boolean) => {
        expect(Uri.is.row(input)).to.eql(expected);
      };
      test('cell:foo!1', true);

      test('', false);
      test(undefined, false);
      test('ns:foo', false);
      test('cell:foo!A', false);
    });

    it('is.column', () => {
      const test = (input?: string, expected?: boolean) => {
        expect(Uri.is.column(input)).to.eql(expected);
      };
      test('cell:foo!A', true);

      test('', false);
      test(undefined, false);
      test('ns:foo', false);
      test('row:foo!1', false);
    });
  });

  describe('parse', () => {
    it('ns', () => {
      const res = Uri.parse<t.INsUri>('ns:foo');
      expect(res.ok).to.eql(true);
      expect(res.error).to.eql(undefined);
      expect(res.parts.type).to.eql('NS');
      expect(res.parts.id).to.eql('foo');
      expect(res.uri).to.eql('ns:foo');
      expect(res.toString()).to.eql(res.uri);
    });

    it('cell', () => {
      const res = Uri.parse<t.ICellUri>('cell:foo!A1');
      expect(res.ok).to.eql(true);
      expect(res.error).to.eql(undefined);
      expect(res.parts.type).to.eql('CELL');
      expect(res.parts.id).to.eql('foo!A1');
      expect(res.parts.ns).to.eql('foo');
      expect(res.parts.key).to.eql('A1');
      expect(res.uri).to.eql('cell:foo!A1');
      expect(res.toString()).to.eql(res.uri);
    });

    it('cell (row)', () => {
      const res = Uri.parse<t.IRowUri>('cell:foo!1');
      expect(res.ok).to.eql(true);
      expect(res.error).to.eql(undefined);
      expect(res.parts.type).to.eql('ROW');
      expect(res.parts.id).to.eql('foo!1');
      expect(res.parts.ns).to.eql('foo');
      expect(res.parts.key).to.eql('1');
      expect(res.uri).to.eql('cell:foo!1');
      expect(res.toString()).to.eql(res.uri);
    });

    it('cell (column)', () => {
      const res = Uri.parse<t.IColumnUri>('cell:foo!A');
      expect(res.ok).to.eql(true);
      expect(res.error).to.eql(undefined);
      expect(res.parts.type).to.eql('COLUMN');
      expect(res.parts.id).to.eql('foo!A');
      expect(res.parts.ns).to.eql('foo');
      expect(res.parts.key).to.eql('A');
      expect(res.uri).to.eql('cell:foo!A');
      expect(res.toString()).to.eql(res.uri);
    });

    it('file', () => {
      const res = Uri.parse<t.IFileUri>('file:foo:123');
      expect(res.ok).to.eql(true);
      expect(res.error).to.eql(undefined);
      expect(res.parts.type).to.eql('FILE');
      expect(res.parts.id).to.eql('foo:123');
      expect(res.parts.ns).to.eql('foo');
      expect(res.parts.file).to.eql('123');
      expect(res.uri).to.eql('file:foo:123');
      expect(res.toString()).to.eql(res.uri);
    });

    it('strips query-string', () => {
      const test = (uri: string) => {
        const res = Uri.parse(uri);
        expect(res.ok).to.eql(true);
        expect(res.uri).to.eql(uri.split('?')[0]);
      };
      test('file:foo:123?hash=abc');
      test('ns:foo?hash=abc');
      test('cell:foo!A1?hash=abc');
      test('cell:foo!A?hash=abc');
      test('cell:foo!1?hash=abc');
    });

    describe('error', () => {
      it('error: UNKNOWN', () => {
        const test = (input: string | undefined) => {
          const res = Uri.parse(input);
          expect(res.ok).to.eql(false);
          expect(res.parts.type).to.eql('UNKNOWN');
          expect(res.uri).to.eql((input || '').trim());
        };
        test(undefined);
        test('');
        test('   ');
        test('foo');
        test('foo:bar');
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

      it('cell: no namespace', () => {
        const test = (input: string) => {
          const res = Uri.parse<t.ICellUri>(input);
          expect(res.ok).to.eql(false);
          expect(res.error && res.error.message).to.contain(`ID of 'cell' not found`);
        };
        test('cell:');
        test('cell:  ');
        test('  cell:  ');
      });

      it('cell: no key', () => {
        const res = Uri.parse<t.ICellUri>('cell:foo');
        expect(res.ok).to.eql(false);
        expect(res.error && res.error.message).to.contain(`URI does not contain a "!" character`);
        expect(res.parts.key).to.eql('');
        expect(res.parts.ns).to.eql('');
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

  describe('create', () => {
    it('ns', () => {
      const test = (id: string, expected: string) => {
        const res = Uri.create.ns(id);
        expect(res).to.eql(expected);
      };
      test('foo', 'ns:foo');
      test('ns:foo', 'ns:foo');
      test(' ns::foo ', 'ns:foo');
    });

    it('file', () => {
      const test = (ns: string, file: string, expected: string) => {
        const res = Uri.create.file(ns, file);
        expect(res).to.eql(expected);
      };
      test('foo', '123', 'file:foo:123');
      test(' foo ', ' 123 ', 'file:foo:123');
      test('file:foo', '123', 'file:foo:123');
    });

    it('cell', () => {
      const test = (ns: string, key: string, expected: string) => {
        const res = Uri.create.cell(ns, key);
        expect(res).to.eql(expected);
      };
      test('foo', 'A1', 'cell:foo!A1');
      test('foo', '!A1', 'cell:foo!A1');
      test('foo', '!!A1', 'cell:foo!A1');
    });

    it('row', () => {
      const test = (ns: string, key: string, expected: string) => {
        const res = Uri.create.row(ns, key);
        expect(res).to.eql(expected);
      };
      test('foo', '1', 'cell:foo!1');
      test('foo', '!1', 'cell:foo!1');
      test('foo', '!!1', 'cell:foo!1');
    });

    it('column', () => {
      const test = (ns: string, key: string, expected: string) => {
        const res = Uri.create.column(ns, key);
        expect(res).to.eql(expected);
      };
      test('foo', 'A', 'cell:foo!A');
      test('foo', '!A', 'cell:foo!A');
      test('foo', '!!A', 'cell:foo!A');
    });

    const ILLEGAL = {
      NS: '~`!@#$%^&*()_-+=,./?;|[]{}',
    };

    it('throws: ns', () => {
      expect(() => Uri.create.ns(':')).to.throw();
      expect(() => Uri.create.ns('ns:')).to.throw();
      expect(() => Uri.create.ns('  ns:  ')).to.throw();

      // Illegal characters.
      ILLEGAL.NS.split('').forEach(char => {
        const uid = cuid();
        const id = `${uid.substring(0, 10)}${char}${uid.substring(11)}`;
        expect(() => Uri.create.ns(id)).to.throw();
        expect(() => Uri.create.ns(`ns:${id}`)).to.throw();
      });
    });

    it('throws: ns (not cuid)', () => {
      const err = /URI contains an invalid "ns" identifier/;
      expect(() => Uri.create.ns('fail')).to.throw(err);
      expect(() => Uri.create.ns('ns:fail')).to.throw(err);

      const uri = Uri.parse(`ns:fail`);
      expect(uri.ok).to.eql(false);
      expect(uri.error && uri.error.message).to.match(err);
    });

    it('throws: file', () => {
      expect(() => Uri.create.file(':', 'fileid')).to.throw();
      expect(() => Uri.create.file('ns:', 'fileid')).to.throw();
      expect(() => Uri.create.file('  ns:  ', 'fileid')).to.throw();

      // Illegal namespace characters.
      ILLEGAL.NS.split('').forEach(char => {
        const ns = `ns:foo${char}def`;
        expect(() => Uri.create.file(ns, 'fileid')).to.throw();
      });

      // Illegal file-id characters.
      ILLEGAL.NS.split('').forEach(char => {
        const file = `abc${char}def`;
        expect(() => Uri.create.file('foo', file)).to.throw();
      });
    });

    it('throws: cell', () => {
      expect(() => Uri.create.cell('', 'A1')).to.throw();
      expect(() => Uri.create.cell('foo', '')).to.throw();
      expect(() => Uri.create.cell('foo', '!')).to.throw();
      expect(() => Uri.create.cell('foo', 'A')).to.throw();
      expect(() => Uri.create.cell('foo', '1')).to.throw();
    });

    it('throws: column', () => {
      expect(() => Uri.create.column('', 'A')).to.throw();
      expect(() => Uri.create.column('foo', '')).to.throw();
      expect(() => Uri.create.column('foo', '!')).to.throw();
      expect(() => Uri.create.column('foo', 'A1')).to.throw();
      expect(() => Uri.create.column('foo', '1')).to.throw();
    });

    it('throws: row', () => {
      expect(() => Uri.create.row('', '1')).to.throw();
      expect(() => Uri.create.row('foo', '')).to.throw();
      expect(() => Uri.create.row('foo', '!')).to.throw();
      expect(() => Uri.create.row('foo', 'A1')).to.throw();
      expect(() => Uri.create.row('foo', 'A')).to.throw();
    });
  });
});
