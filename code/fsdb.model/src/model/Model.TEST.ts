import { filter, map } from 'rxjs/operators';
import { Model } from '.';
import { expect, getTestDb, t, time } from '../test';

type IMyThingProps = { count: number };
type IMyOrgProps = { id: string; name: string };

type IMyThing = t.IModel<IMyThingProps>;
type IMyOrgLinks = { thing: IMyThing; things: IMyThing[] };
type IMyOrgDoc = IMyOrgProps & { ref: string; refs: [] };

describe('model', () => {
  let db: t.INeDb;
  beforeEach(async () => (db = await getTestDb({ file: false })));

  const org = {
    path: 'ORG/123',
    doc: { id: '123', name: 'MyOrg' },
    initial: { id: '', name: '' },
  };
  const createOrg = async (options: { put?: boolean } = {}) => {
    if (options.put) {
      await db.put(org.path, org.doc);
    }
    return Model.create<IMyOrgProps, IMyOrgDoc>({ db, path: org.path, initial: org.initial });
  };

  it('model (load)', async () => {
    const model = Model.create<IMyOrgProps>({
      db,
      path: org.path,
      initial: org.initial,
      load: false,
    });

    // Not loaded yet.
    expect(model.path).to.eql(org.path);
    expect(model.exists).to.eql(undefined);
    expect(model.isReady).to.eql(false);
    expect(model.isChanged).to.eql(false);
    expect(model.toObject()).to.eql({});

    // Load while there is no data for the model in the DB.
    await model.load();
    expect(model.isReady).to.eql(true);
    expect(model.exists).to.eql(false);
    expect(model.doc).to.eql({});
    expect(model.toObject()).to.eql({}); // NB: Default empty object, even though no backing data yet.

    // Load again, with data in DB, but not `force` reload.
    await db.put(org.path, org.doc);
    await model.load();
    expect(model.isReady).to.eql(true);
    expect(model.exists).to.eql(false);
    expect(model.doc).to.eql({});
    expect(model.toObject()).to.eql({});

    // Load again after force refresh - data actually loaded now.
    await model.load({ force: true });
    expect(model.isReady).to.eql(true);
    expect(model.isChanged).to.eql(false);
    expect(model.exists).to.eql(true);
    expect(model.doc).to.eql(org.doc);
    expect(model.props.id).to.eql(org.doc.id); // Strongly typed.
    expect(model.props.name).to.eql(org.doc.name); // Strongly typed.
    expect(model.toObject()).to.eql(org.doc);
  });

  it('model (load on creation, default)', async () => {
    const model = await createOrg({ put: true });
    expect(model.isReady).to.eql(false);

    await time.wait(5);
    expect(model.isReady).to.eql(true);
    expect(model.isChanged).to.eql(false);
  });

  describe('ready (promise)', () => {
    it('resolves promise', async () => {
      await db.put(org.path, org.doc);
      const model = Model.create<IMyOrgProps>({
        db,
        path: org.path,
        initial: org.initial,
        load: false,
      });

      let count = 0;
      model.ready.then(() => count++);
      expect(count).to.eql(0);

      await model.load();
      expect(count).to.eql(1);
    });

    it('returns immediately if already loaded', async () => {
      await db.put(org.path, org.doc);
      const model = Model.create<IMyOrgProps>({
        db,
        path: org.path,
        initial: org.initial,
        load: false,
      });
      await model.load();
      await model.ready;
      expect(model.isReady).to.eql(true);
    });

    it('fires after autoload', async () => {
      await db.put(org.path, org.doc);
      const model = await Model.create<IMyOrgProps>({ db, path: org.path, initial: org.initial })
        .ready;
      expect(model.isReady).to.eql(true);
    });
  });

  describe('props (synthetic object)', () => {
    it('get', async () => {
      const model = await createOrg({ put: true });
      await model.ready;
      expect(model.props.id).to.eql(org.doc.id);
      expect(model.props.name).to.eql(org.doc.name);
    });

    it('caches [props] object', async () => {
      const model = await createOrg();
      const res1 = model.props;
      const res2 = model.props;
      expect(res1).to.equal(res2);
    });

    it('set: isChanged/changes and "changed" event', async () => {
      const model = await createOrg({ put: true });
      await model.ready;

      const events: t.ModelEvent[] = [];
      model.events$.subscribe(e => events.push(e));

      expect(model.isChanged).to.eql(false);
      expect(model.changes.total).to.eql(0);
      expect(model.changes.list).to.eql([]);
      expect(model.changes.map).to.eql({});

      const now = time.now.timestamp;
      model.props.name = 'Acme';

      expect(model.isChanged).to.eql(true);
      expect(model.changes.total).to.eql(1);

      const { list, map } = model.changes;
      expect(map).to.eql({ name: 'Acme' });
      expect(list.length).to.eql(1);
      expect(list[0].field).to.eql('name');
      expect(list[0].value.from).to.eql('MyOrg');
      expect(list[0].value.to).to.eql('Acme');
      expect(list[0].model).to.equal(model);
      expect(list[0].doc.from).to.eql(org.doc);
      expect(list[0].doc.to).to.eql({ ...org.doc, name: 'Acme' });
      expect(list[0].modifiedAt).to.be.within(now - 5, now + 10);

      expect(events.length).to.eql(1);
      expect(events[0].payload).to.equal(model.changes.list[0]);

      model.props.name = 'Foo';

      expect(events.length).to.eql(2);
      expect(events[1].payload).to.equal(model.changes.list[1]);

      expect(model.isChanged).to.eql(true);
      expect(model.changes.total).to.eql(2);
      expect(model.changes.list.length).to.eql(2);
      expect(model.changes.map).to.eql({ name: 'Foo' });

      expect(model.doc).to.eql(org.doc); // No change to underlying doc.
    });
  });

  it('fires loaded event', async () => {
    const model = Model.create<IMyOrgProps>({
      db,
      path: org.path,
      initial: org.initial,
      load: false,
    });

    const events: t.IModelDataLoaded[] = [];
    model.events$
      .pipe(
        filter(e => e.type === 'MODEL/loaded/data'),
        map(e => e.payload as t.IModelDataLoaded),
      )
      .subscribe(e => events.push(e));

    await model.load();
    await model.load();
    await model.load();
    expect(model.exists).to.eql(false);
    expect(events.length).to.eql(1);
    expect(events[0].withLinks).to.eql(false);

    await db.put(org.path, org.doc);
    await model.load({ force: true, withLinks: true });
    expect(model.exists).to.eql(true);
    expect(events.length).to.eql(2);
    expect(events[1].withLinks).to.eql(true);
  });

  it('timestamps', async () => {
    const model = Model.create<IMyOrgProps>({
      db,
      path: org.path,
      initial: org.initial,
      load: false,
    });
    expect(model.createdAt).to.eql(-1);
    expect(model.modifiedAt).to.eql(-1);

    const now = time.now.timestamp;

    await db.put(org.path, org.doc);
    await model.load();

    expect(model.createdAt).to.be.within(now - 5, now + 10);
    expect(model.modifiedAt).to.be.within(now - 5, now + 10);

    await time.wait(50);
    await db.put(org.path, org.doc);
    await model.load({ force: true });
    expect(model.modifiedAt).to.be.within(now + 45, now + 65);
  });

  describe('link (JOIN)', () => {
    beforeEach(async () => {
      await db.putMany([
        { key: 'THING/1', value: { count: 1 } },
        { key: 'THING/2', value: { count: 2 } },
        { key: 'THING/3', value: { count: 3 } },
      ]);
    });

    const links: t.ILinkedModelResolvers<IMyOrgProps, IMyOrgDoc, IMyOrgLinks> = {
      thing: {
        relationship: '1:1',
        resolve: async e => {
          // NB: `ref` is on underlying document, but not the model's pulic <P> type.
          const path = e.model.doc.ref as string;
          const db = e.db;
          return path
            ? Model.create<IMyThingProps>({ db, path, initial: { count: -1 } })
            : undefined;
        },
      },
      things: {
        relationship: '1:*',
        resolve: async e => {
          // NB: `refs` is on underlying document, but not the model's public <P> type.
          const paths = (e.model.doc.refs || []) as string[];
          const db = e.db;
          return Promise.all(
            paths.map(
              path => Model.create<IMyThingProps>({ db, path, initial: { count: -1 } }).ready,
            ),
          );
        },
      },
    };

    it('has no links', async () => {
      const model = await createOrg();
      expect(model.links).to.eql({});
    });

    it('link', async () => {
      await db.put(org.path, {
        ...org.doc,
        refs: ['THING/1', 'THING/3'],
        ref: 'THING/2',
      });
      const model = Model.create<IMyOrgProps, IMyOrgDoc, IMyOrgLinks>({
        db,
        path: org.path,
        initial: org.initial,
        links,
      });
      await model.ready;

      const thing = await model.links.thing;
      const things = await model.links.things;

      expect(thing.toObject()).to.eql({ count: 2 });
      expect(things.map(m => m.toObject())).to.eql([{ count: 1 }, { count: 3 }]);
    });

    it('fires link-loaded event', async () => {
      await db.put(org.path, {
        ...org.doc,
        refs: ['THING/1', 'THING/3'],
        ref: 'THING/2',
      });
      const model = Model.create<IMyOrgProps, IMyOrgDoc, IMyOrgLinks>({
        db,
        path: org.path,
        initial: org.initial,
        links,
        load: false,
      });

      const events: t.IModelLinkLoaded[] = [];
      model.events$
        .pipe(
          filter(e => e.type === 'MODEL/loaded/link'),
          map(e => e.payload as t.IModelLinkLoaded),
        )
        .subscribe(e => events.push(e));

      await model.load();
      expect(events.length).to.eql(0);

      await model.links.thing;
      await model.links.things;

      expect(events.length).to.eql(2);
      expect(events[0].field).to.eql('thing');
      expect(events[1].field).to.eql('things');
    });

    it('caches', async () => {
      await db.put(org.path, {
        ...org.doc,
        refs: ['THING/1', 'THING/3'],
        ref: 'THING/2',
      });
      const model = Model.create<IMyOrgProps, IMyOrgDoc, IMyOrgLinks>({
        db,
        path: org.path,
        initial: org.initial,
        links,
      });
      await model.ready;

      const readLinks = async () => {
        return {
          thing: await model.links.thing,
          things: await model.links.things,
        };
      };

      const res1 = await readLinks();
      const res2 = await readLinks();

      expect(res1.thing.toObject()).to.eql({ count: 2 });
      expect(res1.things.map(m => m.toObject())).to.eql([{ count: 1 }, { count: 3 }]);

      expect(res1.thing).to.equal(res2.thing);
      expect(res1.things).to.equal(res2.things);

      model.reset();
      const res3 = await readLinks();

      // New instances after [reset].
      expect(res3.thing).to.not.equal(res2.thing);
      expect(res3.things).to.not.equal(res2.things);

      expect(res3.thing.toObject()).to.eql({ count: 2 });
      expect(res3.things.map(m => m.toObject())).to.eql([{ count: 1 }, { count: 3 }]);

      await model.load({ force: true });
      const res4 = await readLinks();

      // New instances after force [load].
      expect(res4.thing).to.not.equal(res3.thing);
      expect(res4.things).to.not.equal(res3.things);
    });

    it('gets links via `load` method', async () => {
      await db.put(org.path, {
        ...org,
        refs: ['THING/1', 'THING/3'],
        ref: 'THING/2',
      });
      const model = Model.create<IMyOrgProps, IMyOrgDoc, IMyOrgLinks>({
        db,
        path: org.path,
        initial: org.initial,
        links,
        load: false,
      });

      const events: t.ModelEvent[] = [];
      model.events$.subscribe(e => events.push(e));
      expect(events.length).to.eql(0);

      await model.load({ withLinks: true });

      expect(events.length).to.eql(3);
      expect(events[0].type).to.eql('MODEL/loaded/link');
      expect(events[1].type).to.eql('MODEL/loaded/link');
      expect(events[2].type).to.eql('MODEL/loaded/data');

      expect((events[2].payload as t.IModelDataLoaded).withLinks).to.eql(true);

      const linkEvents = events as t.IModelLinkLoadedEvent[];
      expect(linkEvents[0].payload.field).to.eql('thing');
      expect(linkEvents[1].payload.field).to.eql('things');
    });
  });
});
