import { expect } from '../test';
import { Url, IUrl } from '.';
import { Uri } from '../uri';

describe('Url', () => {
  describe('static', () => {
    it('Url.uri', () => {
      expect(Url.uri).to.equal(Uri);
    });
  });

  describe('fields', () => {
    it('constructs parsing default fields (protocol, host, port, origin)', () => {
      const test = (
        args: IUrl,
        host: string,
        port: number,
        protocol: 'http' | 'https',
        origin: string,
      ) => {
        const res = Url.create(args);
        expect(res.protocol).to.eql(protocol);
        expect(res.host).to.eql(host);
        expect(res.port).to.eql(port);
        expect(res.origin).to.eql(origin);
      };

      test({ host: 'foo.com', port: 1234 }, 'foo.com', 1234, 'https', 'https://foo.com:1234');
      test({ host: 'foo.com:3000' }, 'foo.com', 3000, 'https', 'https://foo.com:3000');
      test({ host: 'foo.com:3000', port: 1234 }, 'foo.com', 1234, 'https', 'https://foo.com:1234');
      test({ host: 'foo.com' }, 'foo.com', 80, 'https', 'https://foo.com');
      test({ host: 'foo.com///' }, 'foo.com', 80, 'https', 'https://foo.com');
      test({ host: 'http://foo.com' }, 'foo.com', 80, 'https', 'https://foo.com');
      test({ host: 'https://foo.com' }, 'foo.com', 80, 'https', 'https://foo.com');
      test({ host: 'foo.com:8080' }, 'foo.com', 8080, 'https', 'https://foo.com:8080');
      test({ host: '//foo.com:8080//' }, 'foo.com', 8080, 'https', 'https://foo.com:8080');
      test({ host: 'foo.com:8080', port: 1234 }, 'foo.com', 1234, 'https', 'https://foo.com:1234');

      test({ host: 'localhost', port: 1234 }, 'localhost', 1234, 'http', 'http://localhost:1234');
      test({ host: 'localhost:1234' }, 'localhost', 1234, 'http', 'http://localhost:1234');
      test({ host: 'localhost' }, 'localhost', 80, 'http', 'http://localhost');
      test({ host: 'localhost/' }, 'localhost', 80, 'http', 'http://localhost');
      test({ host: 'http://localhost' }, 'localhost', 80, 'http', 'http://localhost');
      test({ host: 'https://localhost' }, 'localhost', 80, 'http', 'http://localhost');
      test({ host: 'https://localhost:1234' }, 'localhost', 1234, 'http', 'http://localhost:1234');
    });
  });
});
