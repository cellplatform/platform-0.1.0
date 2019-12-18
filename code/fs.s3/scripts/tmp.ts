/**
 *
 * Upload example (article):
 * - https://www.digitalocean.com/community/tutorials/how-to-upload-a-file-to-object-storage-with-node-js
 *
 */

import { log, fs } from './common';

const tmp = fs.resolve('./tmp');
fs.ensureDirSync(tmp);

const ACCESS = {
  KEY: process.env.SPACES_KEY,
  SECRET: process.env.SPACES_SECRET,
};

const s3 = fs.s3({
  endpoint: 'sfo2.digitaloceanspaces.com',
  accessKey: ACCESS.KEY,
  secret: ACCESS.SECRET,
});

const bucket = s3.bucket('platform');

log.info();

async function testUpload() {
  const fileName = 'foo.json';
  const filePath = fs.join(tmp, fileName);

  await fs.writeJson(filePath, { foo: 123 });

  console.log('\n\nuploading');

  const res = await bucket.put({
    source: filePath,
    key: 'tmp/foo.json',
    acl: 'public-read',
  });

  await bucket.put({
    source: filePath,
    key: 'tmp/bar.json',
    acl: 'public-read',
  });

  console.log('-------------------------------------------');
  console.log('PUT', res);

  const res1 = await bucket.get({ key: `tmp/${fileName}` });
  await res1.save(fs.join(tmp, 'saved.json'));

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
  await res2.save(fs.join(tmp, 'saved.zip'));
}

async function testDelete() {
  // const fileName = 'foo.json';

  // const res = await bucket.deleteOne({
  //   key: 'tmp/foo.json',
  // });

  const res = await bucket.deleteMany({
    keys: ['tmp/foo.json', 'tmp/bar.json'],
  });

  console.log('-------------------------------------------');
  console.log('DELETE', res);
}

(async () => {
  // await testUpload();
  await testDelete();
})();
