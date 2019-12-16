import { expect } from 'chai';
import { http } from '..';
import { fs } from '@platform/fs';

const TMP = fs.resolve('./tmp');
const URL = {
  IMAGE: 'https://platform.sfo2.digitaloceanspaces.com/modules/http/image.png',
  ZIP: 'https://platform.sfo2.digitaloceanspaces.com/modules/http/images.zip',
  JSON: 'https://platform.sfo2.digitaloceanspaces.com/modules/http/foo.json',
};

type IFoo = { name: string; version: string; list: number[] };

describe('http (INTEGRATION)', function() {
  this.timeout(30000);

  it('GET (string)', async () => {
    const res = await http.get(URL.JSON);
    expect(res.status).to.eql(200);
    expect(res.text).to.include('"name": "foo"');
  });

  it('GET (JSON)', async () => {
    const res = await http.get(URL.JSON);
    expect(res.status).to.eql(200);
    expect((res.json as IFoo).name).to.eql('foo');
  });

  it('download using http.get (and fs.stream)', async () => {
    const res = await http.get(URL.ZIP);
    const path = fs.join(TMP, 'images-2.zip');
    if (res.body) {
      await fs.stream.save(path, res.body);
    }
  });
});
