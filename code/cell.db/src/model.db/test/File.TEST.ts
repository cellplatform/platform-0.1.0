import { File } from '..';
import { expect, getFileHash, getTestDb, t } from '../../test';

const INTEGRITY: t.IFileIntegrity = {
  status: 'VALID',
  filehash: 'sha256-abc',
  uploadedAt: 123456789,
  's3:etag': 'abcd-12345',
};

describe('model.File', () => {
  it('create', async () => {
    const db = await getTestDb({ file: true });
    const uri = 'file:foo:123';
    const res1 = await File.create({ db, uri }).ready;

    const HASH = {
      before: 'PREVIOUS-HASH',
      after: 'sha256-cfabee848bd7371db869236f933a128e5e429d4c6ca3ae99f9adac34f5fa3b77',
    };

    await res1.set({ props: { mimetype: 'image/png' }, hash: HASH.before }).save();

    const res2 = await File.create({ db, uri }).ready;
    expect(res2.props.hash).to.eql(HASH.after);
    expect(res2.props.props).to.eql({ mimetype: 'image/png' });
    expect(res2.props.error).to.eql(undefined);
  });

  it('updates hash on save', async () => {
    const db = await getTestDb({});
    const uri = 'file:foo:123';
    const hash = {
      jpg: await getFileHash('kitten.jpg'),
      png: await getFileHash('bird.png'),
    };

    const model1 = await File.create({ db, uri }).ready;
    expect(model1.props.hash).to.eql(undefined);

    await model1
      .set({
        props: {
          integrity: { ...INTEGRITY, filehash: hash.jpg },
        },
      })
      .save();
    expect(model1.props.hash).to.not.eql(undefined);

    const model2 = await File.create({ db, uri }).ready;
    expect(model2.toObject().hash).to.eql(model1.props.hash);

    const before = model2.props.hash;
    await model2
      .set({
        props: { integrity: { ...INTEGRITY, filehash: hash.png } },
      })
      .save();
    expect(model2.props.hash).to.not.eql(before);

    const model3 = await File.create({ db, uri }).ready;
    expect(model3.toObject().hash).to.eql(model2.props.hash);

    await (async () => {
      const before = model3.props.hash;
      await model3.save({ force: true });
      expect(model3.props.hash).to.eql(before); // NB: No change.
    })();
  });
});
