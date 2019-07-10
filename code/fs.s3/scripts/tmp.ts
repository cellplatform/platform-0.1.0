/**
 *
 * Upload example (article):
 * - https://www.digitalocean.com/community/tutorials/how-to-upload-a-file-to-object-storage-with-node-js
 *
 */

import { AWS, log, fs } from './common';
import { s3 as fsS3 } from '../src';

const dir = fs.resolve('./.dev/tmp');
fs.ensureDirSync(dir);

const ACCESS = {
  KEY: process.env.SPACES_KEY,
  SECRET: process.env.SPACES_SECRET,
};

log.info.green('tmp');

const spacesEndpoint = new AWS.Endpoint('sfo2.digitaloceanspaces.com');
const s3 = new AWS.S3({
  endpoint: spacesEndpoint as any,
  accessKeyId: ACCESS.KEY,
  secretAccessKey: ACCESS.SECRET,
});

// console.log('spacesEndpoint', spacesEndpoint);

// s3.listBuckets((err, data) => {
//   console.log('err', err);
//   console.log('data', data);
// });

log.info();

async function testUpload() {
  try {
    console.log('\n\nuploading111');

    const res = await fsS3.put({
      s3,
      source: fs.join(dir, 'myfile.json'),
      bucket: 'uih',
      key: 'tmp/foo.json',
      acl: 'public-read',
    });

    console.log('-------------------------------------------');
    console.log('res', res);

    const res1 = await fsS3.get({ s3, bucket: 'uih', key: 'tmp/foo.json' });
    await res1.save(fs.join(dir, 'saved.json'));

    console.log('res1', res1);

    console.log('res1.json', res1.json);

    console.log('-------------------------------------------');

    console.log('uploading 2');
    const upload2 = await fsS3.put({
      s3,
      source: fs.join(dir, 'db.zip'),
      bucket: 'uih',
      key: 'tmp/db.zip',
    });

    // console.log('upload2', upload2);

    const res2 = await fsS3.get({ s3, bucket: 'uih', key: 'tmp/db.zip' });
    await res2.save(fs.join(dir, 'saved.zip'));

    // const data = await fs.readFile(path);
    // // const buffer = new Buffer(data, 'binary');

    // const params = {
    //   Bucket: 'uih',
    //   Key: 'tmp/db.zip',
    //   // Body: JSON.stringify(data, null, 2),
    //   Body: data,
    // };

    // const res = await s3.upload(params).promise();
    // console.log('res', res);

    // const res = await s3.upload(params).promise();
    // console.log('uploaded: ', res);
  } catch (error) {
    console.log('error', error);
  }
}

testUpload();
