import { File } from '..';
import { expect, getFileHash, getTestDb } from '../../test';

describe('model.File', () => {
  it('create', async () => {
    const filehash = await getFileHash();
    const db = await getTestDb({ file: true });
    const uri = 'file:foo:123';
    const res1 = await File.create({ db, uri }).ready;

    const HASH = {
      before: 'PREVIOUS-HASH',
      after: 'sha256-54ca3758688c673c032335a070cb5f0329eefb8ec8a02ed4218ed1de247e4b74',
    };

    await res1
      .set({ props: { filename: 'image.png', mimetype: 'image/png', filehash }, hash: HASH.before })
      .save();

    const res2 = await File.create({ db, uri }).ready;
    expect(res2.props.hash).to.eql(HASH.after);

    expect(res2.props.props).to.eql({
      filename: 'image.png',
      mimetype: 'image/png',
      filehash,
    });
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

    await model1.set({ props: { filename: 'image.jpg', filehash: hash.jpg } }).save();
    expect(model1.props.hash).to.not.eql(undefined);

    const model2 = await File.create({ db, uri }).ready;
    expect(model2.toObject().hash).to.eql(model1.props.hash);

    const before = model2.props.hash;
    await model2.set({ props: { filehash: hash.png } }).save();
    expect(model2.props.hash).to.not.eql(before);

    const model3 = await File.create({ db, uri }).ready;
    expect(model3.toObject().hash).to.eql(model2.props.hash);

    await (async () => {
      const before = model3.props.hash;
      await model3.save({ force: true });
      expect(model3.props.hash).to.eql(before); // NB: No change.
    })();
  });

  it('auto sets [mimetype] on save', async () => {
    const db = await getTestDb({});
    const uri = 'file:foo:123';

    const test = async (filename: string, expected?: string) => {
      const model1 = (await File.create({ db, uri }).ready).set({ props: { filename } });
      await model1.save();

      const model2 = await File.create({ db, uri }).ready;

      const value1 = (model1.props.props || {}).mimetype;
      const value2 = (model2.props.props || {}).mimetype;

      expect(value1).to.eql(expected);
      expect(value2).to.eql(expected);
    };

    await test('image.png', 'image/png');
    await test('image.jpg', 'image/jpeg');
    await test('image.jpeg', 'image/jpeg');
    await test('image.gif', 'image/gif');

    await test('doc.txt', 'text/plain');
    await test('style.css', 'text/css');
    await test('doc.pdf', 'application/pdf');
    await test('code.js', 'application/javascript');

    await test('foo', undefined);
    await test('foo.unknown', undefined);
  });

  it('does not write over existing mimetype', async () => {
    const db = await getTestDb({});
    const uri = 'file:foo:123';

    const mimetype = 'application/x-x509-ca-cert';
    const model1 = await File.create({ db, uri }).ready;
    model1.set({ props: { mimetype } });
    await model1.save();
    expect((model1.props.props || {}).mimetype).to.eql(mimetype);

    model1.set({ props: { ...model1.toObject().props, filename: 'foo.png' } });
    expect((model1.props.props || {}).mimetype).to.eql(mimetype);

    const model2 = await File.create({ db, uri }).ready;
    expect((model2.props.props || {}).mimetype).to.eql(mimetype);
  });
});
