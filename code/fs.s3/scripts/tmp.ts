import { AWS, log, fs } from './common';

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
