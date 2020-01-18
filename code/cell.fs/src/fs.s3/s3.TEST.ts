import { expect, initS3 } from '../test';
import { parse as parseUrl } from 'url';

describe('S3', () => {
  it('type', () => {
    const fs = initS3();
    expect(fs.type).to.eql('S3');
  });

  describe('paths', () => {
    it('throws if no bucket in path', () => {
      const test = (path: string) => {
        const fn = () => initS3({ path });
        expect(fn).to.throw(/does not contain a bucket/);
      };
      test(' ');
      test('/');
      test(' / ');
      test('///');
      test(' /// ');
    });

    it('paths', () => {
      const test = (path: string, expectedBucket: string, expectedRoot: string) => {
        const fs = initS3({ path });
        expect(fs.bucket).to.eql(expectedBucket, `bucket: ${expectedBucket}`);
        expect(fs.root).to.eql(expectedRoot, `root: ${expectedRoot}`);
      };

      test('platform/tmp/test', 'platform', '/tmp/test');
      test('platform/  tmp/test  ', 'platform', '/tmp/test');

      test('/platform/tmp/test', 'platform', '/tmp/test');
      test('//platform/tmp/test', 'platform', '/tmp/test');
      test('//platform/  tmp/test  ', 'platform', '/tmp/test');

      test('platform', 'platform', '/');
      test('   platform   ', 'platform', '/');
      test('/platform', 'platform', '/');
      test('/platform/', 'platform', '/');
      test(' /platform/ ', 'platform', '/');
      test('///platform///', 'platform', '/');
      test('  ///platform///  ', 'platform', '/');
    });

    it('resolve (uri => path)', () => {
      const fs = initS3();
      const test = (uri: string, expected: string) => {
        const res = fs.resolve(uri);
        expect(res.path).to.eql(`/tmp/test/${expected}`);
        expect(res.props).to.eql({});
      };
      test('file:foo:123', 'ns.foo/123');
      test('file:ck3jldh1z00043fetc11ockko:1z53tcj', 'ns.ck3jldh1z00043fetc11ockko/1z53tcj');
    });

    it('resolve (SIGNED/get)', () => {
      const fs = initS3();
      const res = fs.resolve('file:foo:123', { type: 'SIGNED/get', seconds: 5 });
      const url = parseUrl(res.path, true);
      expect(res.props).to.eql({});
      expect(url.host).to.eql('platform.sfo2.digitaloceanspaces.com');
      expect(url.pathname).to.eql('/tmp/test/ns.foo/123');
      expect(url.query.Signature).to.match(/=$/);
    });

    it('resolve (SIGNED/put)', () => {
      const fs = initS3();
      const res = fs.resolve('file:foo:123', { type: 'SIGNED/put', seconds: 5 });
      const url = parseUrl(res.path, true);
      expect(res.props).to.eql({});
      expect(url.host).to.eql('platform.sfo2.digitaloceanspaces.com');
      expect(url.pathname).to.eql('/tmp/test/ns.foo/123');
      expect(url.query.Signature).to.match(/=$/);
    });

    it('resolve (SIGNED/post)', () => {
      const fs = initS3();
      const res = fs.resolve('file:foo:123', { type: 'SIGNED/post', seconds: 5 });
      expect(res.path).to.eql('https://sfo2.digitaloceanspaces.com/platform');
      expect(res.props.bucket).to.eql('platform');
      expect(res.props.key).to.eql('tmp/test/ns.foo/123');
      expect(typeof res.props.Policy).to.eql('string');
      expect(typeof res.props['X-Amz-Signature']).to.eql('string');
    });
  });
});
