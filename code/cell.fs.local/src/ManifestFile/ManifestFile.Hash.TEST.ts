import { ManifestHash } from '@platform/cell.schema';

import { ManifestFile } from '.';
import { FsIndexerLocal } from '..';
import { expect, TestUtil } from '../test';

const fs = TestUtil.node;

describe('ManifestFileHash', () => {
  beforeEach(() => TestUtil.reset());

  it('hash.files - {manifest}', async () => {
    const dir = fs.resolve('static.test');
    const indexer = FsIndexerLocal({ fs, dir });
    const manifest = await indexer.manifest();
    const hash = ManifestHash.files(manifest.files);
    expect(manifest.hash.files).to.eql(hash);
  });

  it('hash.filehash', async () => {
    const dir = fs.resolve('static.test');
    const indexer = FsIndexerLocal({ fs, dir });
    const manifest = await indexer.manifest();

    const filename = 'images/award.svg';
    const file = manifest.files.find((file) => file.path === filename);
    const hash = await ManifestFile.Hash.filehash(fs, fs.join(dir, filename));

    expect(hash).to.match(/^sha256-/);
    expect(hash).to.eql(file?.filehash);
  });
});
