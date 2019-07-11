import { expect } from 'chai';
import { download } from '.';
import { fs } from '@platform/fs';

const TMP = fs.resolve('./tmp');

describe.skip('download (INTEGRATION)', function() {
  this.timeout(30000);
  afterEach(async () => fs.remove(TMP));

  it('downloads zip file', async () => {
    const url = 'https://uih.sfo2.digitaloceanspaces.com/%40platform/http/images.zip';
    const path = fs.join(TMP, 'images.zip');
    await download(url).save(path);

    const size = await fs.size.file(path);
    expect(size.bytes).to.greaterThan(665000);
  });
});
