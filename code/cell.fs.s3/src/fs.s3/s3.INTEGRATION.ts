import { t, expect, util, log } from '../test';

const initS3 = () => util.initS3({ path: 'platform/tmp/test.cell.fs' });

describe('S3 (INTEGRATION)', function() {
  this.timeout(900000);

  it('write', async () => {
    await util.reset();
    const fs = initS3();

    const uri = 'file:foo:bird';
    const filename = 'bird.png';
    const png = await util.image(filename);
    const res = await fs.write(`  ${uri} `, png, { filename }); // NB: URI padded with spaces (corrected internally).
    const file = res.file;

    expect(res.ok).to.eql(true);
    expect(res.status).to.eql(200);
    expect(res.uri).to.eql(uri);

    const location = 'https://platform.sfo2.digitaloceanspaces.com/tmp/test.cell.fs/ns.foo/bird';
    expect(file.location).to.eql(location);
    expect(file.path).to.eql('/tmp/test.cell.fs/ns.foo/bird');

    log.info('WRITE', res);
  });

  it('info', async () => {
    await util.reset();
    const fs = initS3();

    const uri = 'file:foo:bird';
    const filename = 'bird.png';
    const png = await util.image(filename);
    await fs.write(uri, png, { filename });

    const res = await fs.info(uri);

    expect(res.uri).to.eql(uri);
    expect(res.exists).to.eql(true);
    expect(res.bytes).to.greaterThan(0);

    const location = 'https://platform.sfo2.digitaloceanspaces.com/tmp/test.cell.fs/ns.foo/bird';
    expect(res.location).to.eql(location);
    expect(res.path).to.eql('/tmp/test.cell.fs/ns.foo/bird');

    expect(res['s3:etag']?.length).to.greaterThan(0);

    log.info('INFO', res);
  });

  it('read', async () => {
    await util.reset();
    const fs = initS3();

    const uri = 'file:foo:bird';
    const filename = 'bird.png';
    const png = await util.image(filename);
    await fs.write(uri, png, { filename });

    const res = await fs.read(uri);
    const file = res.file as t.IFsFileData;

    expect(res.ok).to.eql(true);
    expect(res.status).to.eql(200);
    expect(res.uri).to.eql(uri);

    const location = 'https://platform.sfo2.digitaloceanspaces.com/tmp/test.cell.fs/ns.foo/bird';
    expect(file.location).to.eql(location);
    expect(file.path).to.eql('/tmp/test.cell.fs/ns.foo/bird');
    expect(file.bytes).to.greaterThan(-1);
    expect(file.hash).to.match(/^sha256-/);

    log.info('READ', res);
  });

  it('delete (one)', async () => {
    await util.reset();
    const fs = initS3();

    const uri = 'file:foo:bird';
    const filename = 'bird.png';
    const png = await util.image(filename);

    const res1 = await fs.write(uri, png, { filename });
    expect(res1.ok).to.eql(true);
    expect(res1.status).to.eql(200);

    const res2 = await fs.read(uri);
    expect(res2.status).to.eql(200);

    const res3 = await fs.delete(uri);
    expect(res3.status).to.eql(200);
    expect(res3.error).to.eql(undefined);

    const location = 'https://platform.sfo2.digitaloceanspaces.com/tmp/test.cell.fs/ns.foo/bird';
    expect(res3.locations.length).to.eql(1);
    expect(res3.locations[0]).to.eql(location);

    const res4 = await fs.read(uri);
    expect(res4.ok).to.eql(false);
    expect(res4.status).to.eql(404);
  });

  it('delete (many)', async () => {
    await util.reset();
    const fs = initS3();

    const uri1 = 'file:foo:bird';
    const uri2 = 'file:foo:kitten';

    const png = await util.image('bird.png');
    const jpg = await util.image('kitten.jpg');

    await fs.write(uri1, png, { filename: 'bird.png' });
    await fs.write(uri2, jpg, { filename: 'kitten.jpg' });

    expect((await fs.read(uri1)).status).to.eql(200);
    expect((await fs.read(uri2)).status).to.eql(200);

    const res = await fs.delete([uri1, uri2]);

    expect(res.ok).to.eql(true);
    expect(res.status).to.eql(200);
    expect(res.error).to.eql(undefined);
    expect(res.locations.length).to.eql(2);

    const location1 = 'https://platform.sfo2.digitaloceanspaces.com/tmp/test.cell.fs/ns.foo/bird';
    const location2 = 'https://platform.sfo2.digitaloceanspaces.com/tmp/test.cell.fs/ns.foo/kitten';
    expect(res.locations[0]).to.eql(location1);
    expect(res.locations[1]).to.eql(location2);

    expect((await fs.read(uri1)).status).to.eql(404);
    expect((await fs.read(uri2)).status).to.eql(404);
  });
});
