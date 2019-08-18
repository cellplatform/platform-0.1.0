import { expect } from 'chai';
import { http } from '..';

const URL = {
  JSON: 'https://platform.sfo2.digitaloceanspaces.com/modules/http/foo.json',
};

type IFoo = { name: string; version: string; list: number[] };

describe('http (INTEGRATION)', function() {
  this.timeout(30000);

  it('GET (string)', async () => {
    const res = await http.get(URL.JSON);
    expect(res.status).to.eql(200);
    expect(res.body).to.include('"name": "foo"');
  });

  it('GET (JSON)', async () => {
    const res = await http.get(URL.JSON);
    expect(res.status).to.eql(200);
    expect(res.json<IFoo>().name).to.eql('foo');
  });
});
