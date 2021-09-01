import { expect, fs } from '../test';
import { http } from '..';
import crypto from 'crypto';

const TMP = fs.resolve('./tmp');
const URL = {
  IMAGE: 'https://platform.sfo2.digitaloceanspaces.com/modules/http/image.png',
  ZIP: 'https://platform.sfo2.digitaloceanspaces.com/modules/http/images.zip',
  JSON: 'https://platform.sfo2.digitaloceanspaces.com/modules/http/foo.json',
  TEXT: 'https://platform.sfo2.digitaloceanspaces.com/modules/http/file.txt',
};

type IFoo = { name: string; version: string; list: number[] };

describe('http (INTEGRATION)', function () {
  this.timeout(30000);

  it('GET (text/plain)', async () => {
    const res = await http.get(URL.TEXT);
    expect(res.status).to.eql(200);
    expect(res.text).to.include(`Hello 🐷`);

    expect(res.contentType.mime).to.eql('text/plain');
    expect(res.contentType.is.text).to.eql(true);
    expect(res.contentType.is.json).to.eql(false);
    expect(res.contentType.is.binary).to.eql(false);
  });

  it('GET (application/json)', async () => {
    const res = await http.get(URL.JSON);
    expect(res.status).to.eql(200);
    expect((res.json as IFoo).name).to.eql('foo');

    expect(res.contentType.mime).to.eql('application/json');
    expect(res.contentType.is.text).to.eql(false);
    expect(res.contentType.is.json).to.eql(true);
    expect(res.contentType.is.binary).to.eql(false);
  });

  it('download using http.get (and fs.stream)', async () => {
    const res = await http.get(URL.ZIP);
    if (res.body) {
      const path = fs.join(TMP, 'images-2.zip');
      await fs.stream.save(path, res.body);
    }

    expect(res.contentType.mime).to.eql('application/zip');
    expect(res.contentType.is.text).to.eql(false);
    expect(res.contentType.is.json).to.eql(false);
    expect(res.contentType.is.binary).to.eql(true);
  });

  it('post file (SHA1 checksum)', async () => {
    /**
     * Upload file(s)
     *    https://vercel.com/docs/api#endpoints/deployments/upload-deployment-files
     */
    const path = fs.resolve('src/test/assets/kitten.jpg');
    const file = await fs.readFile(path);
    const hash = shasum(file);

    const token = process.env.VERCEL_TEST_TOKEN ?? '';
    const headers = {
      Authorization: `Bearer ${token}`,
      'x-vercel-digest': hash,
      'Content-Length': file.byteLength.toString(),
      'Content-Type': 'application/octet-stream',
    };

    const url = 'https://api.vercel.com/v2/now/files';
    const res = await http.post(url, file, { headers });
    expect(res.status).to.eql(200);
  });
});

/**
 * Helpers
 */

function shasum(file: Buffer) {
  return crypto.createHash('sha1').update(file).digest('hex');
}
