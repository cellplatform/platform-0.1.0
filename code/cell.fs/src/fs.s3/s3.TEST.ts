import { expect, util } from '../test';
import { s3 } from '.';

export const init = (args: { path?: string } = {}) => {
  return s3.init({
    endpoint: 'sfo2.digitaloceanspaces.com',
    accessKey: util.env('SPACES_KEY'),
    secret: util.env('SPACES_SECRET'),
    root: args.path || 'platform/tmp/test',
  });
};

describe('S3', () => {
  it('type', () => {
    const fs = init();
    expect(fs.type).to.eql('S3');
  });

  describe('paths', () => {
    it('throws if no bucket in path', () => {
      const test = (path: string) => {
        const fn = () => init({ path });
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
        const fs = init({ path });
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
      const fs = init();
      const test = (uri: string, expected: string) => {
        const res = fs.resolve(uri);
        expect(res).to.eql(`/tmp/test/${expected}`);
      };
      test('file:foo.123', 'ns.foo/123');
      test('file:ck3jldh1z00043fetc11ockko.1z53tcj', 'ns.ck3jldh1z00043fetc11ockko/1z53tcj');
    });
  });
});
