import { t, expect, TestUtil, log } from '../test';

// const PROVIDER = 'WASABI';
const PROVIDER = 'SPACES';
const { fs, PATH, BUCKET, ENDPOINT } = TestUtil.init(PROVIDER, '');

const table = log.table({ border: false });
log.info();
table.add(['PROVIDER ', log.green(PROVIDER)]);
table.add(['ENDPOINT', log.green(`${ENDPOINT.origin}`), '(origin)']);
if (ENDPOINT.edge) {
  table.add(['', log.green(`${ENDPOINT.edge}`), '(edge)']);
}
table.add(['BUCKET', log.green(BUCKET)]);
table.add(['PATH', log.green(PATH)]);
log.info(table.toString());

describe('S3 (Integration)', function () {
  this.timeout(99999);
  beforeEach(async () => await TestUtil.reset());

  it('write', async () => {
    const uri = 'file:foo:bird';
    const filename = 'bird.png';
    const png = await TestUtil.image(filename);
    const res = await fs.write(`  ${uri} `, png, { filename }); // NB: URI padded with spaces (corrected internally).
    const file = res.file;

    expect(res.ok).to.eql(true);
    expect(res.status).to.eql(200);
    expect(res.uri).to.eql(uri);
    expect(typeof res['s3:etag']).to.eql('string');
    expect(res['s3:permission']).to.eql('private'); // NB: Private by default.
    expect(file.location).to.eql(`https://${BUCKET}.${ENDPOINT.origin}/${PATH}/ns.foo/bird`);
    expect(file.path).to.eql(`/${PATH}/ns.foo/bird`);

    // log.info('WRITE', res);
    // log.info('-------------------------------------------');
    // log.info(location);

    const read = await fs.read(uri);
    const info = await fs.info(uri);
    expect(read['s3:permission']).to.eql('private');
    expect(info['s3:permission']).to.eql('private');
  });

  it('write (public)', async () => {
    const uri = 'file:foo:public';
    const filename = 'public/bird.png';
    const png = await TestUtil.image('bird.png');
    const res = await fs.write(uri, png, { filename, permission: 'public-read' }); // NB: URI padded with spaces (corrected internally).
    expect(res['s3:permission']).to.eql('public-read');

    // log.info('WRITE', res);
    // log.info('-------------------------------------------');
    // log.info(`${BASE_URL}}/ns.foo/public`);

    const read = await fs.read(uri);
    const info = await fs.info(uri);
    expect(read['s3:permission']).to.eql('public-read');
    expect(info['s3:permission']).to.eql('public-read');
  });

  it('info', async () => {
    const uri = 'file:foo:bird';
    const filename = 'bird.png';
    const png = await TestUtil.image(filename);
    await fs.write(uri, png, { filename });

    const res = await fs.info(uri);

    expect(res.uri).to.eql(uri);
    expect(res.exists).to.eql(true);
    expect(res.bytes).to.greaterThan(0);

    expect(res.location).to.eql(fs.resolve(uri).path);
    expect(res.path).to.eql(`/${PATH}/ns.foo/bird`);
    expect(res['s3:etag']?.length).to.greaterThan(0);

    // log.info('INFO', res);
  });

  it('read', async () => {
    const uri = 'file:foo:bird';
    const filename = 'bird.png';
    const png = await TestUtil.image(filename);
    await fs.write(uri, png, { filename });

    const res = await fs.read(uri);
    const file = res.file as t.IFsFileData;

    expect(res.ok).to.eql(true);
    expect(res.status).to.eql(200);
    expect(res.uri).to.eql(uri);

    expect(file.path).to.eql(`/${PATH}/ns.foo/bird`);
    expect(file.bytes).to.greaterThan(-1);
    expect(file.hash).to.match(/^sha256-/);

    expect(file.location.endsWith('/ns.foo/bird')).to.eql(true);
    if ((PROVIDER as string) === 'SPACES') {
      expect(file.location).to.include('.cdn.');
    }

    // log.info('READ', res);
  });

  it('read (error: 404)', async () => {
    const uri = 'file:foo:noexist';
    const res = await fs.read(uri);
    expect(res.status).to.eql(404);
    expect(res.error?.type).to.eql('FS/read');
  });

  it('delete (one)', async () => {
    const uri = 'file:foo:bird';
    const filename = 'bird.png';
    const png = await TestUtil.image(filename);

    const res1 = await fs.write(uri, png, { filename });
    expect(res1.ok).to.eql(true);
    expect(res1.status).to.eql(200);

    const res2 = await fs.read(uri);
    expect(res2.status).to.eql(200);

    const res3 = await fs.delete(uri);
    expect(res3.status).to.eql(200);
    expect(res3.error).to.eql(undefined);

    expect(res3.locations.length).to.eql(1);
    expect(res3.locations[0]).to.match(/\/ns.foo\/bird$/);

    const res4 = await fs.read(uri);
    expect(res4.ok).to.eql(false);
    expect(res4.status).to.eql(404);
  });

  it('delete (many)', async () => {
    const uri1 = 'file:foo:bird';
    const uri2 = 'file:foo:kitten';

    const png = await TestUtil.image('bird.png');
    const jpg = await TestUtil.image('kitten.jpg');

    await fs.write(uri1, png, { filename: 'bird.png' });
    await fs.write(uri2, jpg, { filename: 'kitten.jpg' });

    expect((await fs.read(uri1)).status).to.eql(200);
    expect((await fs.read(uri2)).status).to.eql(200);

    const res = await fs.delete([uri1, uri2]);

    expect(res.ok).to.eql(true);
    expect(res.status).to.eql(200);
    expect(res.error).to.eql(undefined);
    expect(res.locations.length).to.eql(2);

    expect(res.locations[0]).to.match(/\/ns.foo\/bird$/);
    expect(res.locations[1]).to.match(/\/ns.foo\/kitten$/);

    expect((await fs.read(uri1)).status).to.eql(404);
    expect((await fs.read(uri2)).status).to.eql(404);
  });

  it('copy', async () => {
    const png = await TestUtil.image('bird.png');
    const sourceUri = 'file:foo:bird1';
    const targetUri = 'file:bar:bird2';

    await fs.delete(targetUri);

    let targetInfo = await fs.info(targetUri);
    expect(targetInfo.exists).to.eql(false);

    await fs.write(sourceUri, png);
    const res1 = await fs.copy(sourceUri, targetUri);

    expect(res1.status).to.eql(200);
    expect(res1.ok).to.eql(true);
    expect(res1.source).to.eql('file:foo:bird1');
    expect(res1.target).to.eql('file:bar:bird2');
    expect(res1.error).to.eql(undefined);

    targetInfo = await fs.info(targetUri);
    expect(targetInfo.exists).to.eql(true);
    expect(targetInfo['s3:permission']).to.eql('private');

    const targetFile = await fs.read(targetUri);
    expect(targetFile.status).to.eql(200);
    expect(targetFile.file?.data.toString()).to.eql(png.toString());

    const res2 = await fs.copy(sourceUri, targetUri, { permission: 'public-read' });
    targetInfo = await fs.info(targetUri);
    expect(res2.status).to.eql(200);
    expect(targetInfo['s3:permission']).to.eql('public-read');
  });

  it('copy (error)', async () => {
    // 404
    const sourceUri = 'file:foo:noexist';
    const targetUri = 'file:bar:bird2';
    const res = await fs.copy(sourceUri, targetUri);
    expect(res.status).to.eql(404);
    expect(res.error?.type).to.eql('FS/copy');
    expect(res.error?.message).to.include('does not exist');
  });
});
