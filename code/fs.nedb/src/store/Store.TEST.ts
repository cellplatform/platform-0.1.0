import { expect, fs, time } from '../../test/test';
import { Store } from '.';

const dir = fs.resolve('tmp');
const filename = fs.join(dir, 'test.db');
const removeDir = () => fs.remove(dir);

describe('Store (nedb)', function() {
  this.timeout(20000);

  beforeEach(async () => {
    await removeDir();
  });

  afterEach(async () => {
    await removeDir();
  });

  it('constructs', () => {
    const db = Store.create({});
    expect(db).to.be.an.instanceof(Store);
  });

  it('inserts a single document', async () => {
    type MyDoc = { name: string; _id?: string };
    const db = Store.create<MyDoc>({});

    const res1 = await db.find({ name: 'foo' });
    expect(res1).to.eql([]);

    const res2 = await db.insert({ name: 'foo' });
    expect(res2.name).to.eql('foo');

    const res3 = await db.find({});
    expect(res3.length).to.eql(1);
    expect(res3[0].name).to.eql('foo');

    const res4 = await db.findOne({ name: 'foo' });
    expect(res4.name).to.eql('foo');
  });

  it('inserts multiple documents', async () => {
    type MyDoc = { name: string; _id?: string };
    const db = Store.create<MyDoc>({});

    const res1 = await db.insertMany([{ name: 'foo' }, { name: 'bar' }]);
    expect(res1[0].name).to.eql('foo');
    expect(res1[1].name).to.eql('bar');

    expect((await db.findOne({ name: 'foo' })).name).to.eql('foo');
    expect((await db.findOne({ name: 'bar' })).name).to.eql('bar');
    expect(await db.findOne({ name: 'boo' })).to.eql(null);
  });

  it('persists to file-system', async () => {
    await removeDir();
    expect(await fs.pathExists(filename)).to.eql(false);

    const db1 = Store.create({ filename, autoload: true });
    const res1 = await db1.insert({ name: 'foo' });
    expect(res1.name).to.eql('foo');
    expect(await fs.pathExists(filename)).to.eql(true);

    const db2 = Store.create({ filename, autoload: true });

    const res2 = await db2.findOne({ name: 'foo' });
    expect(res2.name).to.eql('foo');
  });
});
