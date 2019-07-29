import { filter, map } from 'rxjs/operators';

import { Model } from '.';
import { expect, getTestDb, t, time } from '../test';

type IMyThingFields = { count: number };
type IMyOrgFields = { id: string; name: string; refs: string[]; ref?: string };

export type IMyThing = t.IModel<IMyThingFields>;
export type IMyOrgLinks = { thing: IMyThing; things: IMyThing[] };
export type IMyOrg = t.IModel<IMyOrgFields, IMyOrgLinks>;

describe('model', () => {
  let db: t.INeDb;
  beforeEach(async () => (db = await getTestDb({ file: false })));

  const id = '123';
  const org: IMyOrgFields = { id, name: 'MyOrg', refs: [] };
  const orgPath = 'ORG/123';

  it('model (load)', async () => {
    const model = Model.create<IMyOrgFields>({ db, path: orgPath, load: false });

    // Not read yet.
    expect(model.isReady).to.eql(false);
    expect(model.exists).to.eql(undefined);
    expect(model.data).to.eql({});
    expect(model.path).to.eql(orgPath);

    // Load, but not in DB.
    await model.load();
    expect(model.isReady).to.eql(true);
    expect(model.exists).to.eql(false);
    expect(model.data).to.eql({}); // NB: Default empty object, even though no backing data yet.

    // Load again, with data in DB, but not `force` reload.
    await db.put(orgPath, org);
    await model.load();
    expect(model.isReady).to.eql(true);
    expect(model.exists).to.eql(false);
    expect(model.data).to.eql({});

    // Load again after force refresh - data actually loaded now.
    await model.load({ force: true });
    expect(model.isReady).to.eql(true);
    expect(model.exists).to.eql(true);
    expect(model.data).to.eql(org);
    expect(model.data.name).to.eql(org.name); // Strongly typed.
  });

  it('model (load on creation, default)', async () => {
    await db.put(orgPath, org);
    const model = Model.create<IMyOrgFields>({ db, path: orgPath });
    expect(model.isReady).to.eql(false);

    await time.wait(5);
    expect(model.isReady).to.eql(true);
  });

  describe('ready (promise)', () => {
    it('resolves promise', async () => {
      await db.put(orgPath, org);
      const model = Model.create<IMyOrgFields>({ db, path: orgPath, load: false });

      let count = 0;
      model.ready.then(() => count++);
      expect(count).to.eql(0);

      await model.load();
      expect(count).to.eql(1);
    });

    it('returns immediately if already loaded', async () => {
      await db.put(orgPath, org);
      const model = Model.create<IMyOrgFields>({ db, path: orgPath, load: false });
      await model.load();
      await model.ready;
      expect(model.isReady).to.eql(true);
    });

    it('fires after autoload', async () => {
      await db.put(orgPath, org);
      const model = await Model.create<IMyOrgFields>({ db, path: orgPath }).ready;
      expect(model.isReady).to.eql(true);
    });
  });

  it('fires loaded event', async () => {
    const model = Model.create<IMyOrgFields>({ db, path: orgPath, load: false });

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

    await db.put(orgPath, org);
    await model.load({ force: true, withLinks: true });
    expect(model.exists).to.eql(true);
    expect(events.length).to.eql(2);
    expect(events[1].withLinks).to.eql(true);
  });

  it('timestamps', async () => {
    const model = Model.create<IMyOrgFields>({ db, path: orgPath, load: false });
    expect(model.createdAt).to.eql(-1);
    expect(model.modifiedAt).to.eql(-1);

    const now = time.now.timestamp;

    await db.put(orgPath, org);
    await model.load();

    expect(model.createdAt).to.be.within(now - 5, now + 10);
    expect(model.modifiedAt).to.be.within(now - 5, now + 10);

    await time.wait(50);
    await db.put(orgPath, org);
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

    const links: t.ILinkedModelResolvers<IMyOrgFields, IMyOrgLinks> = {
      thing: async e => {
        const db = e.db;
        const path = e.model.data.ref;
        return path ? Model.create<IMyThingFields>({ db, path }) : undefined;
      },
      things: async e => {
        const db = e.db;
        const paths = e.model.data.refs || [];
        return Promise.all(paths.map(path => Model.create<IMyThingFields>({ db, path }).ready));
      },
    };

    it('has no links', async () => {
      const model = Model.create<IMyOrgFields>({ db, path: orgPath });
      expect(model.links).to.eql({});
    });

    it('link', async () => {
      await db.put(orgPath, { id, name: 'MyOrg', refs: ['THING/1', 'THING/3'], ref: 'THING/2' });
      const model = Model.create<IMyOrgFields, IMyOrgLinks>({ db, path: orgPath, links });
      await model.ready;

      const thing = await model.links.thing;
      const things = await model.links.things;

      expect(thing.data).to.eql({ count: 2 });
      expect(things.map(m => m.data)).to.eql([{ count: 1 }, { count: 3 }]);
    });

    it('fires link-loaded event', async () => {
      await db.put(orgPath, { id, name: 'MyOrg', refs: ['THING/1', 'THING/3'], ref: 'THING/2' });
      const model = Model.create<IMyOrgFields, IMyOrgLinks>({
        db,
        path: orgPath,
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
      expect(events[0].prop).to.eql('thing');
      expect(events[1].prop).to.eql('things');
    });

    it('caches', async () => {
      await db.put(orgPath, { id, name: 'MyOrg', refs: ['THING/1', 'THING/3'], ref: 'THING/2' });
      const model = Model.create<IMyOrgFields, IMyOrgLinks>({ db, path: orgPath, links });
      await model.ready;

      const readLinks = async () => {
        return {
          thing: await model.links.thing,
          things: await model.links.things,
        };
      };

      const res1 = await readLinks();
      const res2 = await readLinks();

      expect(res1.thing.data).to.eql({ count: 2 });
      expect(res1.things.map(m => m.data)).to.eql([{ count: 1 }, { count: 3 }]);

      expect(res1.thing).to.equal(res2.thing);
      expect(res1.things).to.equal(res2.things);

      model.reset();
      const res3 = await readLinks();

      // New instances after [reset].
      expect(res3.thing).to.not.equal(res2.thing);
      expect(res3.things).to.not.equal(res2.things);

      expect(res3.thing.data).to.eql({ count: 2 });
      expect(res3.things.map(m => m.data)).to.eql([{ count: 1 }, { count: 3 }]);

      await model.load({ force: true });
      const res4 = await readLinks();

      // New instances after force [load].
      expect(res4.thing).to.not.equal(res3.thing);
      expect(res4.things).to.not.equal(res3.things);
    });

    it('gets links via `load` method', async () => {
      await db.put(orgPath, { id, name: 'MyOrg', refs: ['THING/1', 'THING/3'], ref: 'THING/2' });
      const model = Model.create<IMyOrgFields, IMyOrgLinks>({
        db,
        path: orgPath,
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
      expect(linkEvents[0].payload.prop).to.eql('thing');
      expect(linkEvents[1].payload.prop).to.eql('things');
    });
  });
});
