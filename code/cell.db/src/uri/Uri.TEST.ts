import { expect, t } from '../test';
import { Uri } from './Uri';

describe('Uri', () => {
  describe('parse', () => {
    it('ns', () => {
      const res = Uri.parse<t.INsUri>('ns:123456');
      expect(res.ok).to.eql(true);
      expect(res.error).to.eql(undefined);
      expect(res.data.type).to.eql('ns');
      expect(res.data.id).to.eql('123456');
    });

    it('cell', () => {
      const res = Uri.parse<t.ICellUri>('cell:123456789:abcd');
      expect(res.ok).to.eql(true);
      expect(res.error).to.eql(undefined);
      expect(res.data.type).to.eql('cell');
      expect(res.data.id).to.eql('123456789:abcd');
      expect(res.data.ns).to.eql('123456789');
    });

    it('row', () => {
      const res = Uri.parse<t.ICellUri>('row:123456789:abcd');
      expect(res.ok).to.eql(true);
      expect(res.error).to.eql(undefined);
      expect(res.data.type).to.eql('row');
      expect(res.data.id).to.eql('123456789:abcd');
      expect(res.data.ns).to.eql('123456789');
    });

    it('col', () => {
      const res = Uri.parse<t.ICellUri>('col:123456789:abcd');
      expect(res.ok).to.eql(true);
      expect(res.error).to.eql(undefined);
      expect(res.data.type).to.eql('col');
      expect(res.data.id).to.eql('123456789:abcd');
      expect(res.data.ns).to.eql('123456789');
    });

    describe('error', () => {
      it('error: UNKNOWN', () => {
        const test = (input: string | undefined) => {
          const res = Uri.parse(input);
          expect(res.ok).to.eql(false);
          expect(res.data.type).to.eql('UNKNOWN');
          expect(res.text).to.eql((input || '').trim());
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
          expect(res.error && res.error.message).to.contain('Namespace ID not found');
        };
        test('ns:');
        test('ns: ');
      });

      it('cell: no ID', () => {
        const res = Uri.parse<t.ICellUri>('cell:');
        expect(res.ok).to.eql(false);
        expect(res.error && res.error.message).to.contain(`ID of 'cell' not found`);
      });
    });
  });
});
