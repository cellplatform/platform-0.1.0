import { expect } from 'chai';
import { download } from '.';
import { fs } from '@platform/fs';

const TMP = fs.resolve('./tmp');

describe('download (INTEGRATION)', function() {
  this.timeout(30000);
  afterEach(async () => fs.remove(TMP));

  it('downloads zip file', async () => {
    const url = 'https://platform.sfo2.digitaloceanspaces.com/modules/http/images.zip';
    const path = fs.join(TMP, 'images.zip');

    const file = download(url);

    const res = await file.save(path);
    expect(res.ok).to.eql(true);
    expect(res.status).to.eql(200);

    const size = await fs.size.file(path);
    expect(size.bytes).to.greaterThan(665000);
  });
});
