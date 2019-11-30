import { expect, util } from '../test';
import { init } from './s3.TEST';

describe('S3 (INTEGRATION)', function() {
  this.timeout(30000);

  it('write', async () => {
    await util.reset();
    const fs = init();

    const png = await util.loadImage('bird.png');
    const uri = 'file:foo.bird';
    const res = await fs.write(`  ${uri} `, png); // NB: URI padded with spaces (corrected internally).

    expect(res.status).to.eql(200);
    expect(res.file.uri).to.eql(uri);

    expect(res.file.path.startsWith('https://')).to.eql(true);
    expect(res.file.path).to.contains('digitaloceanspaces.com');
    expect(res.file.path).to.contains('tmp/test/ns.foo/bird');
  });
});
