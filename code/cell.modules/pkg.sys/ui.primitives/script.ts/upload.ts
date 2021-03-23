import { HttpClient } from '@platform/cell.client';
import { fs } from '@platform/fs';

(async () => {
  // const origin = HttpClient.create('localhost:8080');
  const origin = HttpClient.create('https://os.ngrok.io/');
  const client = origin.cell('cell:ckmld6jm000005bqtedve0ic1:A1');

  // console.log('client.origin', client.origin);

  // const url = client.url.uri
  console.log('client.url.uri', client.url.uri);

  const filename = 'tmp/hello.png';
  const file = await fs.readFile(fs.resolve('static/images/hello.png'));
  const res = await client.fs.upload({ filename, data: file });

  console.log('-------------------------------------------');
  console.log('res', res);

  console.log('-------------------------------------------');
  // const url = ;
  console.log('file', client.url.file.byName(filename).toString());
  console.log('cell', client.url.info.toString());
})();
