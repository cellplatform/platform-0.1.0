import { expect } from '../test';
import * as util from './util';

describe('Url: util', () => {
  describe('toProtocol', () => {
    it('https', () => {
      const test = (input: string) => {
        expect(util.toProtocol(input)).to.eql('https');
      };
      test('');
      test('  ');
      test('domain.com');
      test('  domain.com  ');
      test('localhost.com');
    });

    it('localhost => http', () => {
      const test = (input: string) => {
        expect(util.toProtocol(input)).to.eql('http');
      };
      test('localhost');
      test('  localhost  ');
      test('localhost:1234');
      test(' localhost:1234  ');
    });

    it('192.168.x.x => http (internal IP)', () => {
      const test = (input: string) => {
        expect(util.toProtocol(input)).to.eql('http');
      };
      test('192.168.1.1');
      test('  192.168.255.255  ');
    });
  });
});
