/**
 *
 * Upload example (article):
 * - https://www.digitalocean.com/community/tutorials/how-to-upload-a-file-to-object-storage-with-node-js
 *
 */

import { log, fs } from './common';

const dir = fs.resolve('./.dev/tmp');
fs.ensureDirSync(dir);

const ACCESS = {
  KEY: process.env.SPACES_KEY,
  SECRET: process.env.SPACES_SECRET,
};

const s3 = fs.s3({
  endpoint: 'sfo2.digitaloceanspaces.com',
  accessKey: ACCESS.KEY,
  secret: ACCESS.SECRET,
});

const bucket = s3.bucket('uih');

log.info();

async function testUpload() {
  console.log('\n\nuploading');

  const res = await bucket.put({
    source: fs.join(dir, 'myfile.json'),
    key: 'tmp/foo.json',
    acl: 'public-read',
  });

  console.log('-------------------------------------------');
  console.log('res', res);

  const res1 = await bucket.get({ key: 'tmp/foo.json' });
  await res1.save(fs.join(dir, 'saved.json'));

  console.log('res1', res1);
  console.log('res1.json', res1.json);
  console.log('-------------------------------------------');

  // console.log('uploading 2');
  // const upload2 = await bucket.put({
  //   source: fs.join(dir, 'db.zip'),
  //   key: 'tmp/db.zip',
  //   acl: 'public-read',
  // });

  // // console.log('upload2', upload2);

  const res2 = await bucket.get({ key: 'tmp/db.zip' });
  console.log('res2', res2);
  await res2.save(fs.join(dir, 'saved.zip'));
}

testUpload();
