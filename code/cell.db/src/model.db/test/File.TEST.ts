import { File } from '..';
import { expect, getTestDb, fs, util, getFileHash } from '../../test';

describe('model.File', () => {
  it('create', async () => {
    const fileHash = await getFileHash();
    const db = await getTestDb({ file: true });
    const uri = 'file:foo.123';
    const res1 = await File.create({ db, uri }).ready;

    const HASH = {
      before: 'PREVIOUS-HASH',
      after: 'sha256-4fa72e2366885a57ed47e236e3fe14adb1ae85ec1e049059403b21584f44d68e',
    };

    await res1
      .set({ props: { name: 'image.png', mimetype: 'image/png', fileHash }, hash: HASH.before })
      .save();

    const res2 = await File.create({ db, uri }).ready;
    expect(res2.props.hash).to.eql(HASH.after);

    expect(res2.props.props).to.eql({ name: 'image.png', mimetype: 'image/png', fileHash });
    expect(res2.props.error).to.eql(undefined);
  });

  it('updates hash on save', async () => {
    const db = await getTestDb({});
    const uri = 'file:foo.123';
    const image = {
      jpg: await getFileHash('kitten.jpg'),
      png: await getFileHash('bird.png'),
    };

    const model1 = await File.create({ db, uri }).ready;
    expect(model1.props.hash).to.eql(undefined);

    await model1.set({ props: { name: 'image.jpg', fileHash: image.jpg } }).save();
    expect(model1.props.hash).to.not.eql(undefined);

    const model2 = await File.create({ db, uri }).ready;
    expect(model2.toObject().hash).to.eql(model1.props.hash);

    const before = model2.props.hash;
    await model2.set({ props: { fileHash: image.png } }).save();
    expect(model2.props.hash).to.not.eql(before);

    const model3 = await File.create({ db, uri }).ready;
    expect(model3.toObject().hash).to.eql(model2.props.hash);

    await (async () => {
      const before = model3.props.hash;
      await model3.save({ force: true });
      expect(model3.props.hash).to.eql(before); // NB: No change.
    })();
  });

  it.skip('auto sets [mimetype] on save', async () => {
    //
  });
});
