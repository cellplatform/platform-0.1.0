import { expect, t } from '../../test';
import { prepare, Samples, uploadBundle } from './util';

describe('/fn:run (HTTP headers)', function () {
  this.timeout(999999);

  /**
   * Ensure the sample code as been bundled.
   */
  before(async () => {
    const force = false;
    await Samples.node.bundle(force);
  });

  it('contentType: text/html', async () => {
    const dir = 'foo';
    const { mock, bundle, client, http, url } = await prepare({ dir });
    const { host, uri } = bundle;
    await uploadBundle(client, Samples.node.outdir, bundle);

    const body: t.IReqPostFuncBody = [{ host, uri, dir, entry: 'web.js' }];
    const res = await http.post(url.toString(), body);
    await mock.dispose();

    expect(res.contentType.mime).to.eql('text/html');
    expect(res.text).to.eql('<h1>hello</h1>');
  });
});
