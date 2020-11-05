/**
 *
 * Upload example (article):
 * - https://www.digitalocean.com/community/tutorials/how-to-upload-a-file-to-object-storage-with-node-js
 *
 */

import { log, fs } from './common';

const tmp = fs.resolve('./tmp');
fs.ensureDirSync(tmp);

function loadEnv(provider: string) {
  const env = (suffix: string) => fs.env.value(`${provider}_${suffix}`);
  const endpoint = env('ENDPOINT');
  const accessKey = env('KEY');
  const secret = env('SECRET');
  const bucket = env('BUCKET');
  return { provider, endpoint, bucket, accessKey, secret };
}

const init = (provider: string) => {
  const { bucket, endpoint, accessKey, secret } = loadEnv(provider);
  const s3 = fs.s3({ endpoint, accessKey, secret });
  return { provider, s3, bucket: s3.bucket(bucket) };
};

// const { provider, bucket } = init('SPACES');
const { provider, bucket } = init('WASABI');

log.info.cyan(provider);

async function testUpload() {
  const fileName = 'foo.json';
  const filePath = fs.join(tmp, fileName);

  await fs.writeJson(filePath, { foo: 1234 });
  const file = await fs.readFile(filePath);

  console.log('\n\nuploading');

  const res = await bucket.put({
    data: file,
    key: 'tmp/foo.json',
    acl: 'public-read',
  });

  await bucket.put({
    data: file,
    key: 'tmp/bar.json',
    acl: 'private',
  });

  console.log('-------------------------------------------');
  console.log('PUT', res);

  const res1 = await bucket.get({ key: `tmp/${fileName}` });
  await fs.writeFile(fs.join(tmp, 'saved.json'), res1.data);

  console.log('GET', res1);
  console.log('GET json', res1.json);
  console.log('-------------------------------------------');

  // console.log('uploading 2');
  // const upload2 = await bucket.put({
  //   source: fs.join(dir, 'db.zip'),
  //   key: 'tmp/db.zip',
  //   acl: 'public-read',
  // });

  // // console.log('upload2', upload2);

  const res2 = await bucket.get({ key: `tmp/${fileName}` });
  console.log('GET', res2);
  await fs.writeFile(fs.join(tmp, 'saved.zip'), res2.data);
}

async function testPut() {
  const fileName = 'foo.json';
  const filePath = fs.join(tmp, fileName);

  await fs.writeJson(filePath, { foo: 1234 });
  const file = await fs.readFile(filePath);

  const res = await bucket.put({
    data: file,
    key: 'tmp/foo.json',
    acl: 'public-read',
  });

  console.log('PUT', res.status);
}

async function testDelete() {
  // const fileName = 'foo.json';

  // const res = await bucket.deleteOne({
  //   key: 'tmp/foo.json',
  // });

  const res = await bucket.deleteMany({
    keys: ['tmp/foo.json', 'tmp/bar.json', 'tmp/copy.json'],
  });

  console.log('-------------------------------------------');
  console.log('DELETE', res);
}

async function testInfo() {
  const foo = await bucket.get({ key: 'tmp/foo.json' });
  const bar = await bucket.get({ key: 'tmp/bar.json' });

  console.log('-------------------------------------------');
  console.log('FOO', foo);
  console.log('BAR', bar);
}

async function testCopy() {
  const res = await bucket.copy({
    source: 'tmp/foo.json',
    target: 'tmp/copy.json',
    acl: 'public-read',
  });
  console.log('-------------------------------------------');
  console.log('COPY', res);
}

(async () => {
  await testUpload();
  await testInfo();
  await testPut();
  await testCopy();
  await testDelete();

  log.info();
  log.info.cyan(provider);
})();
