import { expect, fs } from '../test';
import { http } from '..';

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
});
