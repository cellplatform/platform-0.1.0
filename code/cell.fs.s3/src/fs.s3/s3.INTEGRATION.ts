import { t, expect, util, log } from '../test';

const PATH = util.PATH;
const ENV = util.ENV;
const ENDPOINT = ENV.endpoint;
const BUCKET = ENV.bucket;
const BASE_URL = `https://${BUCKET}.${ENDPOINT}/${PATH.KEY}`;

const s3 = () => util.s3({ path: `${BUCKET}/${PATH.KEY}` });

describe('S3 (INTEGRATION)', function () {
  this.timeout(99999);
  beforeEach(async () => await util.reset());

  it('write', async () => {
    const fs = s3();
    const uri = 'file:foo:bird';
    const filename = 'bird.png';
    const png = await util.image(filename);
    const res = await fs.write(`  ${uri} `, png, { filename }); // NB: URI padded with spaces (corrected internally).
    const file = res.file;

    expect(res.ok).to.eql(true);
    expect(res.status).to.eql(200);
    expect(res.uri).to.eql(uri);
    expect(typeof res['s3:etag']).to.eql('string');
    expect(res['s3:permission']).to.eql('private'); // NB: Private by default.

    const location = `${BASE_URL}/ns.foo/bird`;
    expect(file.location).to.eql(location);
    expect(file.path).to.eql(`/${PATH.KEY}/ns.foo/bird`);

    log.info('WRITE', res);
    log.info('-------------------------------------------');
    log.info(location);

    const read = await fs.read(uri);
    const info = await fs.info(uri);
    expect(read['s3:permission']).to.eql('private');
    expect(info['s3:permission']).to.eql('private');
  });

  it('write (public)', async () => {
    const fs = s3();
    const uri = 'file:foo:public';
    const filename = 'public/bird.png';
    const png = await util.image('bird.png');
    const res = await fs.write(uri, png, { filename, permission: 'public-read' }); // NB: URI padded with spaces (corrected internally).
    expect(res['s3:permission']).to.eql('public-read');

    const location = `${BASE_URL}}/ns.foo/public`;

    log.info('WRITE', res);
    log.info('-------------------------------------------');
    log.info(location);

    const read = await fs.read(uri);
    const info = await fs.info(uri);
    expect(read['s3:permission']).to.eql('public-read');
    expect(info['s3:permission']).to.eql('public-read');
  });

  it('info', async () => {
    const fs = s3();
    const uri = 'file:foo:bird';
    const filename = 'bird.png';
    const png = await util.image(filename);
    await fs.write(uri, png, { filename });

    const res = await fs.info(uri);

    expect(res.uri).to.eql(uri);
    expect(res.exists).to.eql(true);
    expect(res.bytes).to.greaterThan(0);

    expect(res.location).to.eql(`${BASE_URL}/ns.foo/bird`);
    expect(res.path).to.eql(`/${PATH.KEY}/ns.foo/bird`);
    expect(res['s3:etag']?.length).to.greaterThan(0);

    log.info('INFO', res);
  });

  it('read', async () => {
    const fs = s3();
    const uri = 'file:foo:bird';
    const filename = 'bird.png';
    const png = await util.image(filename);
    await fs.write(uri, png, { filename });

    const res = await fs.read(uri);
    const file = res.file as t.IFsFileData;

    expect(res.ok).to.eql(true);
    expect(res.status).to.eql(200);
    expect(res.uri).to.eql(uri);

    expect(file.location).to.eql(`${BASE_URL}/ns.foo/bird`);
    expect(file.path).to.eql(`/${PATH.KEY}/ns.foo/bird`);
    expect(file.bytes).to.greaterThan(-1);
    expect(file.hash).to.match(/^sha256-/);

    log.info('READ', res);
  });

  it('read (error: 404)', async () => {
    const fs = s3();
    const uri = 'file:foo:noexist';
    const res = await fs.read(uri);
    expect(res.status).to.eql(404);
    expect(res.error?.type).to.eql('FS/read');
  });

  it('delete (one)', async () => {
    const fs = s3();

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

    expect(res3.locations.length).to.eql(1);
    expect(res3.locations[0]).to.eql(`${BASE_URL}/ns.foo/bird`);

    const res4 = await fs.read(uri);
    expect(res4.ok).to.eql(false);
    expect(res4.status).to.eql(404);
  });

  it('delete (many)', async () => {
    const fs = s3();
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

    expect(res.locations[0]).to.eql(`${BASE_URL}/ns.foo/bird`);
    expect(res.locations[1]).to.eql(`${BASE_URL}/ns.foo/kitten`);

    expect((await fs.read(uri1)).status).to.eql(404);
    expect((await fs.read(uri2)).status).to.eql(404);
  });

  it.skip('copy', async () => {
    const fs = s3();

    const png = await util.image('bird.png');
    const sourceUri = 'file:foo:bird1';
    const targetUri = 'file:bar:bird2';

    // expect((await fs.read(targetUri)).status).to.eql(404);

    await fs.write(sourceUri, png);
    const res = await fs.copy(sourceUri, targetUri);

    console.log('-------------------------------------------');
    console.log('res', res);

    // expect(res.ok).to.eql(true);
    // expect(res.status).to.eql(200);
    // expect(res.source).to.eql('file:foo:bird1');
    // expect(res.target).to.eql('file:bar:bird2');
    // expect(res.error).to.eql(undefined);

    // expect((await fs.read(targetUri)).status).to.eql(200);
  });
});
