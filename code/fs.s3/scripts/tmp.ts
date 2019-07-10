/**
 *
 * Upload example (article):
 * - https://www.digitalocean.com/community/tutorials/how-to-upload-a-file-to-object-storage-with-node-js
 *
 */

import { AWS, log, fs } from './common';
import * as multer from 'multer';
import * as multerS3 from 'multer-s3';

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
  // endpoint,
  accessKeyId: ACCESS.KEY,
  secretAccessKey: ACCESS.SECRET,
});

// console.log('spacesEndpoint', spacesEndpoint);

s3.listBuckets((err, data) => {
  console.log('err', err);
  console.log('data', data);
});

log.info();

async function testUpload() {
  const path = fs.join(dir, 'db.zip');
  console.log('\n\nuploading', path);

  const data = await fs.readFile(path);
  // const buffer = new Buffer(data, 'binary');

  const params = {
    Bucket: 'uih',
    Key: 'tmp/db.zip',
    // Body: JSON.stringify(data, null, 2),
    Body: data,
  };

  const res = await s3.upload(params).promise();
  console.log('res', res);

  // const res = await s3.upload(params).promise();
  // console.log('uploaded: ', res);
}

testUpload();
