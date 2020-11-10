import { expect, util, fs, log, http } from '../test';

import * as FormData from 'form-data';
export { FormData };

const tmp = fs.resolve('./tmp');
fs.ensureDirSync(tmp);

const PROVIDER = 'WASABI';
// const PROVIDER = 'SPACES';

const { s3, BUCKET, ENDPOINT, PATH } = util.init(PROVIDER);
const bucket = s3.bucket(BUCKET);

const table = log.table({ border: false });
log.info();
table.add(['PROVIDER ', log.green(PROVIDER)]);
table.add(['ENDPOINT', log.green(ENDPOINT)]);
table.add(['BUCKET', log.green(BUCKET)]);
table.add(['PATH', log.green(PATH)]);
log.info(table.toString());

const testFile = async () => {
  const filename = 'foo.json';
  const path = fs.join(tmp, filename);
  const json = { foo: 1234 };
  await fs.writeJson(path, json);
  const data = await fs.readFile(path);
  return { filename, path, data, json };
};

describe('S3 (Integration)', function () {
  this.timeout(99999);

  it('upload (signed POST url)', async () => {
    const { data } = await testFile();
    const key = `${PATH}/post.json`;

    const exists = async () => (await bucket.get({ key })).status !== 404;

    await bucket.deleteOne({ key });
    expect(await exists()).to.eql(false);

    const post = s3.url(BUCKET, key).signedPost({ expires: '5m' });

    const contentType = post.props['content-type'];
    const form = new FormData();
    Object.keys(post.props)
      .map((key) => ({ key, value: post.props[key] }))
      .forEach(({ key, value }) => form.append(key, value));
    form.append('file', data, { contentType });

    const headers = form.getHeaders();
    const res = await http.post(post.url, form, { headers });

    // console.log('res.status:', res.status);
    // console.log('res.statusText:', res.statusText);

    expect(res.ok).to.eql(true);
    expect(await exists()).to.eql(true);
  });

  it('bucket.put', async () => {
    const { data, json, filename } = await testFile();

    const res1 = await bucket.put({
      data,
      key: 'tmp/foo.json',
      acl: 'public-read',
    });
    expect(res1.status).to.eql(200);

    await bucket.put({
      data,
      key: 'tmp/bar.json',
      acl: 'private',
    });

    const res2 = await bucket.get({ key: `tmp/${filename}` });
    await fs.writeFile(fs.join(tmp, 'saved.json'), res2.data);
    expect(res2.json).to.eql(json);
  });

  it('bucket.get', async () => {
    const { data, json } = await testFile();
    const key = 'tmp/info.json';
    await bucket.put({ data, key });

    const res = await bucket.get({ key });

    expect(res.ok).to.eql(true);
    expect(res.status).to.eql(200);
    expect(res.key).to.eql(key);
    expect(res.json).to.eql(json);
  });

  it('bucket.deleteOne', async () => {
    const { data } = await testFile();
    const key = 'tmp/delete-0.json';
    await bucket.put({ data, key });

    const res = await bucket.deleteOne({ key });
    expect(res.ok).to.eql(true);
    expect(res.status).to.eql(200);
    expect(res.key).to.eql(key);
    expect(res.bucket).to.eql(BUCKET);
  });

  it('bucket.deleteMany', async () => {
    const { data } = await testFile();
    const keys = ['tmp/delete-1.json', 'tmp/delete-2.json'];

    await Promise.all(
      keys.map(async (key) => {
        await bucket.put({ data, key });
      }),
    );

    const res = await bucket.deleteMany({ keys });
    expect(res.ok).to.eql(true);
    expect(res.status).to.eql(200);
    expect(res.keys).to.eql(keys);
    expect(res.bucket).to.eql(BUCKET);
  });

  it('bucket.copy', async () => {
    const { data } = await testFile();
    const source = 'tmp/source.json';
    const target = 'tmp/target.json';
    await bucket.put({ data, key: 'tmp/source.json' });

    const res = await bucket.copy({ source, target });

    expect(res.status).to.eql(200);
    expect(res.ok).to.eql(true);
    expect(res.source).to.eql({ bucket: BUCKET, key: source });
    expect(res.target).to.eql({ bucket: BUCKET, key: target });
  });
});
