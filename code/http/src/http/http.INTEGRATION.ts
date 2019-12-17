import { expect } from 'chai';
import { http } from '..';
import { fs } from '@platform/fs';

const TMP = fs.resolve('./tmp');
const URL = {
  IMAGE: 'https://platform.sfo2.digitaloceanspaces.com/modules/http/image.png',
  ZIP: 'https://platform.sfo2.digitaloceanspaces.com/modules/http/images.zip',
  JSON: 'https://platform.sfo2.digitaloceanspaces.com/modules/http/foo.json',
  TEXT: 'https://platform.sfo2.digitaloceanspaces.com/modules/http/file.txt',
};

type IFoo = { name: string; version: string; list: number[] };

describe('http (INTEGRATION)', function() {
  this.timeout(30000);

  it('GET (text/plain)', async () => {
    const res = await http.get(URL.TEXT);
    expect(res.status).to.eql(200);
    expect(res.text).to.include(`Hello 🐷`);

    expect(res.contentType.value).to.eql('text/plain');
    expect(res.contentType.is.text).to.eql(true);
    expect(res.contentType.is.json).to.eql(false);
    expect(res.contentType.is.binary).to.eql(false);
  });

  it('GET (application/json)', async () => {
    const res = await http.get(URL.JSON);
    expect(res.status).to.eql(200);
    expect((res.json as IFoo).name).to.eql('foo');

    expect(res.contentType.value).to.eql('application/json');
    expect(res.contentType.is.text).to.eql(false);
    expect(res.contentType.is.json).to.eql(true);
    expect(res.contentType.is.binary).to.eql(false);
  });

  it('download using http.get (and fs.stream)', async () => {
    const res = await http.get(URL.ZIP);
    const path = fs.join(TMP, 'images-2.zip');
    if (res.body) {
      await fs.stream.save(path, res.body);
    }

    expect(res.contentType.value).to.eql('application/zip');
    expect(res.contentType.is.text).to.eql(false);
    expect(res.contentType.is.json).to.eql(false);
    expect(res.contentType.is.binary).to.eql(true);
  });
});
