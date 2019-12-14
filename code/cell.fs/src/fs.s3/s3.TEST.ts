import { expect, util } from '../test';

describe('S3', () => {
  it('type', () => {
    const fs = util.initS3();
    expect(fs.type).to.eql('S3');
  });

  describe('paths', () => {
    it('throws if no bucket in path', () => {
      const test = (path: string) => {
        const fn = () => util.initS3({ path });
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
        const fs = util.initS3({ path });
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

    it('resolve URI to path', () => {
      const fs = util.initS3();
      const test = (uri: string, expected: string) => {
        const res = fs.resolve(uri);
        expect(res).to.eql(`/tmp/test/${expected}`);
      };
      test('file:foo:123', 'ns.foo/123');
      test('file:ck3jldh1z00043fetc11ockko:1z53tcj', 'ns.ck3jldh1z00043fetc11ockko/1z53tcj');
    });
  });
});
