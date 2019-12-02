import { t, expect, util, log } from '../test';

describe('S3 (INTEGRATION)', function() {
  this.timeout(30000);

  it.only('write: png', async () => {
    await util.reset();
    const fs = util.initS3();

    const filename = 'bird.png';
    const png = await util.image(filename);
    const uri = 'file:foo.bird';
    const res = await fs.write(`  ${uri} `, png, { filename }); // NB: URI padded with spaces (corrected internally).
    const file = res.file;

    expect(res.status).to.eql(200);
    expect(res.location).to.eql(
      'https://platform.sfo2.digitaloceanspaces.com/tmp/test/ns.foo/bird',
    );

    expect(file.uri).to.eql(uri);
    expect(file.path.startsWith('https://')).to.eql(true);
    expect(file.path).to.contains('digitaloceanspaces.com');
    expect(file.path).to.contains('tmp/test/ns.foo/bird');

    log.info('WRITE', res);
  });

  it('read', async () => {
    await util.reset();
    const fs = util.initS3();

    const uri = 'file:foo.bird';
    const res = await fs.read(uri);
    const file = res.file as t.IFileSystemFile;

    expect(res.status).to.eql(200);
    expect(res.location).to.eql(
      'https://platform.sfo2.digitaloceanspaces.com/tmp/test/ns.foo/bird',
    );

    expect(file.uri).to.eql(uri);
    expect(file.path.startsWith('https://')).to.eql(true);
    expect(file.path).to.contains('digitaloceanspaces.com');
    expect(file.path).to.contains('tmp/test/ns.foo/bird');

    log.info('READ', res);
  });
});
