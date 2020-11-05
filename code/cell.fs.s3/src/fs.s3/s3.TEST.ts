import { parse as parseUrl } from 'url';
import { expect, util } from '../test';

const PROVIDER = 'SPACES';

describe('S3', () => {
  it('type: "S3"', () => {
    const { fs } = util.init(PROVIDER);
    expect(fs.type).to.eql('S3');
  });

  describe('paths', () => {
    it('throws if no bucket in path', () => {
      const test = (path: string) => {
        const fn = () => util.init(PROVIDER, path);
        expect(fn).to.throw(/does not contain a bucket/);
      };
      test(' ');
      test('/');
      test(' / ');
      test('///');
      test(' /// ');
    });

    it('paths', () => {
      const test = (root: string, expectedBucket: string, expectedRoot: string) => {
        const { fs } = util.init(PROVIDER, root);
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

    it('resolve (DEFAULT)', () => {
      const { fs, BASE_URL } = util.init(PROVIDER);
      const test = (uri: string, expected: string) => {
        const res = fs.resolve(uri);
        const path = `${BASE_URL}/${expected}`;
        expect(res.path).to.eql(path);
        expect(res.props).to.eql({});
      };
      test('file:foo:123', 'ns.foo/123');
      test('file:ck3jldh1z00043fetc11ockko:1z53tcj', 'ns.ck3jldh1z00043fetc11ockko/1z53tcj');
    });

    it('resolve (SIGNED/get)', () => {
      const { fs, BUCKET, ENDPOINT } = util.init(PROVIDER);
      const res = fs.resolve('file:foo:123', { type: 'SIGNED/get', expires: '5m' });
      const url = parseUrl(res.path, true);
      expect(res.props).to.eql({});
      expect(url.host).to.eql(`${BUCKET}.${ENDPOINT}`);
      expect(url.pathname).to.eql('/tmp/test/ns.foo/123');
      expect(url.query.Signature).to.match(/=$/);
    });

    it('resolve (SIGNED/put)', () => {
      const { fs, BUCKET, ENDPOINT } = util.init(PROVIDER);
      const res = fs.resolve('file:foo:123', { type: 'SIGNED/put', expires: '5m' });
      const url = parseUrl(res.path, true);
      expect(res.props).to.eql({});
      expect(url.host).to.eql(`${BUCKET}.${ENDPOINT}`);
      expect(url.pathname).to.eql('/tmp/test/ns.foo/123');
      expect(url.query.Signature).to.match(/=$/);
    });

    it('resolve (SIGNED/post)', () => {
      const { fs, BUCKET, ENDPOINT } = util.init(PROVIDER);
      const res = fs.resolve('file:foo:123', { type: 'SIGNED/post', expires: '5m' });
      expect(res.path).to.eql(`https://${ENDPOINT}/${BUCKET}`);
      expect(res.props.bucket).to.eql(BUCKET);
      expect(res.props.key).to.eql('tmp/test/ns.foo/123');
      expect(typeof res.props.Policy).to.eql('string');
      expect(typeof res.props['X-Amz-Signature']).to.eql('string');
    });
  });
});
