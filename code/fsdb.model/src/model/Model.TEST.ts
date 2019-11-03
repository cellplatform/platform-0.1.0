import { filter, map } from 'rxjs/operators';
import { Model } from '.';
import { expect, getTestDb, t, time } from '../test';

type IMyThingProps = { count: number };
type IMyOrgProps = { id: string; name: string; region?: string };

type IMyThing = t.IModel<IMyThingProps>;
type IMyOrgChildren = { things: IMyThing[]; subthings: IMyThing[]; all: IMyThing[] };
type IMyOrgLinks = { thing: IMyThing; things: IMyThing[] };
type IMyOrgDoc = IMyOrgProps & { ref?: string; refs?: string[] };

describe('model', () => {
  let db: t.IDb;
  beforeEach(async () => (db = await getTestDb({ file: false })));

  const org = {
    path: 'ORG/123',
    doc: { id: '123', name: 'MyOrg' },
    initial: { id: '', name: '', region: undefined },
  };

  const thingFactory: t.ModelFactory<IMyThing> = ({ path, db }) =>
    Model.create<IMyThingProps>({ db, path, initial: { count: -1 } });

  const links: t.IModelLinkDefs<IMyOrgLinks> = {
    thing: {
      relationship: '1:1',
      field: 'ref',
      factory: thingFactory,
    },
    things: {
      relationship: '1:*',
      field: 'refs',
      factory: thingFactory,
    },
  };

  const children: t.IModelChildrenDefs<IMyOrgChildren> = {
    things: { query: '//// *', factory: thingFactory },
    subthings: { query: '/info/*', factory: thingFactory },
    all: { query: '**', factory: thingFactory },
  };

  const createOrg = async (
    options: { put?: boolean; beforeSave?: t.BeforeModelSave<IMyOrgProps> } = {},
  ) => {
    if (options.put) {
      await db.put(org.path, org.doc);
    }
    return Model.create<IMyOrgProps, IMyOrgDoc>({
      db,
      path: org.path,
      initial: org.initial,
      beforeSave: options.beforeSave,
    });
  };

  const createOrgWithLinks = async (
    options: { refs?: string[]; ref?: string; path?: string } = {},
  ) => {
    const { refs, ref, path = org.path } = options;
    await db.put(org.path, { ...org.doc, refs, ref });
    await db.putMany([
      { key: 'THING/1', value: { count: 1 } },
      { key: 'THING/2', value: { count: 2 } },
      { key: 'THING/3', value: { count: 3 } },
    ]);
    const model = Model.create<IMyOrgProps, IMyOrgDoc, IMyOrgLinks>({
      db,
      path,
      initial: org.initial,
      links,
      load: false,
    });
    return model;
  };

  const createOrgWithChildren = async (options: { path?: string } = {}) => {
    const { path = org.path } = options;
    await db.put(org.path, { ...org.doc });
    await db.putMany([
      { key: `${path}/1`, value: { count: 1 } },
      { key: `${path}/2`, value: { count: 2 } },
      { key: `${path}/3`, value: { count: 3 } },

      { key: `${path}/info/a`, value: { count: 123 } },
      { key: `${path}/info/b`, value: { count: 456 } },
    ]);
    const model = Model.create<IMyOrgProps, IMyOrgDoc, {}, IMyOrgChildren>({
      db,
      path,
      initial: org.initial,
      children,
      load: false,
    });
    return model;
  };

  describe('path', () => {
    it('trims path', () => {
      const model = Model.create<IMyOrgProps>({ db, path: ' FOO/1 ', initial: org.initial });
      expect(model.path).to.eql('FOO/1');
    });

    it('throws if there is no path', () => {
      const test = (path: string) => {
        const fn = () => {
          Model.create<IMyOrgProps>({
            db,
            path,
            initial: org.initial,
          });
        };
        expect(fn).to.throw();
      };
      test('');
      test(' ');
    });
  });

  describe('typename', () => {
    it('is derived from path', async () => {
      const test = (path: string, result: string) => {
        const model = Model.create<IMyOrgProps>({ db, path, initial: org.initial });
        expect(model.typename).to.eql(result);
      };
      test('ORG', 'ORG');
      test('ORG/1', 'ORG');
      test(' ORG  /1', 'ORG');
    });

    it('is explicitly declared', async () => {
      const test = (typename: string, result: string) => {
        const model = Model.create<IMyOrgProps>({
          db,
          path: org.path,
          initial: org.initial,
          typename,
        });
        expect(model.typename).to.eql(result);
      };
      test('FOO', 'FOO');
      test('  FOO  ', 'FOO');
    });
  });

  describe('load', () => {
    it('not loaded → load → loaded', async () => {
      const model = Model.create<IMyOrgProps>({
        db,
        path: org.path,
        initial: org.initial,
        load: false,
      });

      // Not loaded yet.
      expect(model.path).to.eql(org.path);
      expect(model.exists).to.eql(undefined);
      expect(model.isLoaded).to.eql(false);
      expect(model.isChanged).to.eql(false);
      expect(model.toObject()).to.eql({});

      // Load while there is no data for the model in the DB.
      await model.load();
      expect(model.isLoaded).to.eql(true);
      expect(model.exists).to.eql(false);
      expect(model.doc).to.eql({});
      expect(model.toObject()).to.eql({}); // NB: Default empty object, even though no backing data yet.

      // Load again, with data in DB, but not `force` reload.
      await db.put(org.path, org.doc);
      await model.load();
      expect(model.isLoaded).to.eql(true);
      expect(model.exists).to.eql(false);
      expect(model.doc).to.eql({});
      expect(model.toObject()).to.eql({});

      // Load again after force refresh - data actually loaded now.
      await model.load({ force: true });
      expect(model.isLoaded).to.eql(true);
      expect(model.isChanged).to.eql(false);
      expect(model.exists).to.eql(true);
      expect(model.doc).to.eql(org.doc);
      expect(model.props.id).to.eql(org.doc.id); // Strongly typed.
      expect(model.props.name).to.eql(org.doc.name); // Strongly typed.
      expect(model.toObject()).to.eql({ id: '123', name: 'MyOrg', region: undefined });
    });

    it('default loading on creation', async () => {
      const model = await createOrg({ put: true });
      expect(model.isLoaded).to.eql(false);

      await time.wait(5);
      expect(model.isLoaded).to.eql(true);
      expect(model.isChanged).to.eql(false);
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
      expect(model.isLoaded).to.eql(true);
    });

    it('fires after autoload', async () => {
      await db.put(org.path, org.doc);
      const model = await Model.create<IMyOrgProps>({ db, path: org.path, initial: org.initial })
        .ready;
      expect(model.isLoaded).to.eql(true);
    });
  });

  describe('system properties', () => {
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

    it('set: changes/isChanged', async () => {
      const model = await createOrg({ put: true });
      await model.ready;

      expect(model.isChanged).to.eql(false);
      expect(model.changes.length).to.eql(0);
      expect(model.changes.list).to.eql([]);
      expect(model.changes.map).to.eql({});

      const now = time.now.timestamp;
      model.props.name = 'Acme';

      expect(model.isChanged).to.eql(true);
      expect(model.changes.length).to.eql(1);

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
      expect(list[0].kind).to.eql('PROP');

      model.props.name = 'Foo';

      expect(model.isChanged).to.eql(true);
      expect(model.changes.length).to.eql(2);
      expect(model.changes.list.length).to.eql(2);
      expect(model.changes.map).to.eql({ name: 'Foo' });

      expect(model.doc).to.eql(org.doc); // No change to underlying doc.
    });

    it('changes property that is underfined on {initial} object', async () => {
      const model = await (await createOrg({ put: true })).ready;
      model.props.region = 'US/west'; // NB: Defined within {initial} configuration.
      model.props.name = 'Acme';

      expect(model.changes.length).to.eql(2);

      const fields = model.changes.list.map(c => c.field);
      expect(fields).to.include('name');
      expect(fields).to.include('region');
    });

    it('set (via method)', async () => {
      const model = await (await createOrg({ put: true })).ready;

      expect(model.props.name).to.eql('MyOrg');
      expect(model.props.id).to.eql('123');
      expect(model.isChanged).to.eql(false);

      model.set({ name: 'Foo' });

      expect(model.isChanged).to.eql(true);
      expect(model.changes.length).to.eql(1);
      expect(model.props.name).to.eql('Foo');
      expect(model.props.id).to.eql('123');

      model.set({ name: 'Bar', id: '456' });

      expect(model.isChanged).to.eql(true);
      expect(model.changes.length).to.eql(3);
      expect(model.props.name).to.eql('Bar');
      expect(model.props.id).to.eql('456');

      await model.save();
      await model.load();

      expect(model.props.name).to.eql('Bar');
      expect(model.props.id).to.eql('456');
      expect(model.isChanged).to.eql(false);
      expect(model.changes.length).to.eql(0);
    });

    it('change not registered if value is current', async () => {
      const model = await createOrg({ put: true });
      await model.ready;
      await model.set({ name: 'foo', region: 'US/west' }).save();
      expect(model.isChanged).to.eql(false);

      model.props.name = 'foo'; //         Same as current.
      model.set({ region: 'US/west' }); // Same as current.

      expect(model.changes.length).to.eql(2); // NB: Changes are registered, but all values are current.
      expect(model.isChanged).to.eql(false);

      await model.save();
      expect(model.changes.length).to.eql(0); // Saving resets the changes.
      expect(model.isChanged).to.eql(false);
    });

    it('changed event', async () => {
      const model = await createOrg({ put: true });
      await model.ready;

      const events: t.ModelEvent[] = [];
      model.events$.subscribe(e => events.push(e));

      model.props.name = 'foo';
      expect(model.isChanged).to.eql(true);

      expect(events.length).to.eql(2);
      expect(events[0].type).to.eql('MODEL/changing');
      expect((events[0].payload as t.IModelChanging).isCancelled).to.eql(false);

      expect(events[1].type).to.eql('MODEL/changed');
      expect(events[1].payload).to.equal(model.changes.list[0]);

      model.props.name = 'foo';
      model.props.name = 'foo';
      model.props.name = 'foo';
      expect(events.length).to.eql(2); // No change.

      model.props.name = 'bar';
      expect(events.length).to.eql(4);
    });

    it('cancels change via event', async () => {
      const model = await createOrg({ put: true });
      await model.ready;

      const events: t.ModelEvent[] = [];
      model.events$.subscribe(e => events.push(e));

      model.events$
        .pipe(
          filter(e => e.type === 'MODEL/changing'),
          map(e => e.payload as t.IModelChanging),
        )
        .subscribe(e => e.cancel());

      model.props.name = 'foo';

      expect(events.length).to.eql(1);

      const event = events[0].payload as t.IModelChanging;
      expect(event.isCancelled).to.eql(true);
      expect(model.isChanged).to.eql(false);
    });
  });

  describe('reading (events)', () => {
    it('read/prop => modify', async () => {
      const model = await createOrg({ put: true });
      await model.ready;

      const read$ = model.events$.pipe(
        filter(e => e.type === 'MODEL/read/prop'),
        map(e => e.payload as t.IModelReadProp),
      );

      const events: t.ModelEvent[] = [];
      const reads: t.IModelReadProp[] = [];

      model.events$.subscribe(e => events.push(e));
      read$.subscribe(e => reads.push(e));

      expect(model.props.name).to.eql('MyOrg');
      expect(events.length).to.eql(1);
      expect(events[0].type).to.eql('MODEL/read/prop');

      read$.subscribe(e => e.modify('Boo'));

      const res = model.props.name;
      expect(events.length).to.eql(2);
      expect(reads[1].isModified).to.eql(true);
      expect(res).to.eql('Boo');
    });
  });

  describe('save', () => {
    it('does not save when nothing changed (but does exist in DB)', async () => {
      const model = await createOrg({ put: true });
      await model.ready;
      expect(model.exists).to.eql(true);

      const res = await model.save();
      expect(res.saved).to.eql(false);
    });

    it('saves when changed (already exists in DB)', async () => {
      const model = await createOrg({ put: true });
      await model.ready;
      expect(model.exists).to.eql(true);

      model.props.name = 'Acme';
      const changes = model.changes;

      const events: t.ModelEvent[] = [];
      model.events$.subscribe(e => events.push(e));

      expect(model.isChanged).to.eql(true);
      const res = await model.save();
      expect(res.saved).to.eql(true);
      expect(model.isChanged).to.eql(false);

      const dbValue = await db.getValue<IMyOrgProps>(org.path);
      expect(dbValue.name).to.eql('Acme');

      expect(events.length).to.eql(1);
      expect(events[0].type).to.eql('MODEL/saved');

      const e = events[0].payload as t.IModelSave;
      expect(e.model).to.equal(model);
      expect(e.changes).to.eql(changes);
    });

    it('initial save (new instance, default values)', async () => {
      const model = await createOrg({ put: false });

      const res1 = await db.getValue<IMyOrgProps>(org.path);
      expect(res1).to.eql(undefined);

      const res2 = await model.save();
      expect(res2.saved).to.eql(true);

      const res3 = await db.getValue<IMyOrgProps>(org.path);
      expect(res3).to.eql(org.initial);
    });

    it('initial save (changed values)', async () => {
      const model = await createOrg({ put: false });

      const res1 = await db.getValue<IMyOrgProps>(org.path);
      expect(res1).to.eql(undefined);

      model.props.id = '123';
      model.props.name = 'Hello';

      expect(model.doc).to.eql({}); // Underlying doc not updated yet, pending changes only.

      const res2 = await model.save();
      expect(res2.saved).to.eql(true);

      expect(model.doc).to.eql({ id: '123', name: 'Hello', region: undefined });
      expect(model.props.id).to.eql('123');
      expect(model.props.name).to.eql('Hello');

      expect((await db.getValue<IMyOrgProps>(org.path)).id).to.eql('123');
      expect((await db.getValue<IMyOrgProps>(org.path)).name).to.eql('Hello');
    });
  });

  describe('beforeSave', () => {
    it('fires [beforeSave] event via [save] method', async () => {
      let count = 0;
      const beforeSave: t.BeforeModelSave = async args => count++;

      const model = await (await createOrg({ put: false, beforeSave })).ready;
      model.set({ region: 'US/west' });

      const events: t.ModelEvent[] = [];
      model.events$.subscribe(e => events.push(e));

      await model.save();
      expect(count).to.eql(1);

      expect(events.length).to.eql(2);
      expect(events[0].type).to.eql('MODEL/beforeSave');
      expect(events[1].type).to.eql('MODEL/saved');
    });

    it('does not run [beforeSave] when handler not given to model', async () => {
      const model = await (await createOrg({ put: false })).ready;

      const events: t.ModelEvent[] = [];
      model.events$.subscribe(e => events.push(e));

      await model.beforeSave();
      expect(events.length).to.eql(0);
    });

    it('does not run [beforeSave] when no changes made', async () => {
      let count = 0;
      const beforeSave: t.BeforeModelSave = async args => count++;

      const model = await (await createOrg({ put: false, beforeSave })).ready;

      const events: t.ModelEvent[] = [];
      model.events$.subscribe(e => events.push(e));

      await model.beforeSave();
      expect(events.length).to.eql(0);
      expect(count).to.eql(0);
    });

    it('changes props before saving', async () => {
      const model1 = await (await createOrg({
        put: false,
        beforeSave: async args => {
          if (args.changes.map.region) {
            // NB:  The region has been changed.
            //      Make a modification to it.
            args.model.props.region = `${args.model.props.region}-1`;
          }
        },
      })).ready;

      model1.props.region = 'US/west';
      await model1.save();

      const model2 = await (await createOrg({ put: false })).ready;
      expect(model2.toObject().region).to.eql('US/west-1'); // NB: Modified value.
    });
  });

  describe('link (JOIN relationship)', () => {
    it('has no links', async () => {
      const model = await createOrg();
      expect(model.links).to.eql({});
    });

    it('links: get when model is loaded (underlying linked doc exists)', async () => {
      const model = await createOrgWithLinks({
        refs: ['THING/1', 'THING/3'],
        ref: 'THING/2',
      });
      const thing = await model.links.thing;
      const things = await model.links.things;

      expect(thing.toObject()).to.eql({ count: 2 });
      expect(things.map(m => m.toObject())).to.eql([{ count: 1 }, { count: 3 }]);
    });

    it('links: get when model is not loaded (underlying linked doc exists)', async () => {
      const model = await createOrgWithLinks();
      expect(model.isLoaded).to.eql(false);

      const thing = await model.links.thing;
      const things = await model.links.things;

      expect(thing).to.eql(undefined);
      expect(things).to.eql([]);
      expect(model.isLoaded).to.eql(true);
    });

    it('links: get when underlying underlying model doc does not exist', async () => {
      const model = await createOrgWithLinks({ path: 'NO_EXIST' });
      await model.load();

      expect(model.isLoaded).to.eql(true);
      expect(model.exists).to.eql(false);

      const thing = await model.links.thing;
      const things = await model.links.things;

      expect(thing).to.eql(undefined);
      expect(things).to.eql([]);
    });

    it('fires link-loaded event', async () => {
      const model = await createOrgWithLinks();
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

    it('caches linked model', async () => {
      const model = await createOrgWithLinks({ refs: ['THING/1', 'THING/3'], ref: 'THING/2' });
      await model.load();

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
      const model = await createOrgWithLinks({ refs: ['THING/1', 'THING/3'], ref: 'THING/2' });

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

    it('change 1:1', async () => {
      const model = await createOrgWithLinks();
      expect(model.changes.map).to.eql({});
      expect((await db.getValue<any>(org.path)).ref).to.eql(undefined);

      /**
       * Link
       */
      const thing = model.links.thing;
      thing.link('THING/2');
      thing.link('THING/2');
      thing.link('THING/2');

      expect(model.changes.length).to.eql(1); // Called 3-times, only one change registered.
      expect(model.isChanged).to.eql(true);
      expect(model.changes.map).to.eql({ ref: 'THING/2' });
      expect(model.changes.list[0].kind).to.eql('LINK');

      expect((await model.links.thing).path).to.eql('THING/2'); // Before save.

      await model.save();
      expect(model.isChanged).to.eql(false);

      expect((await db.getValue<any>(org.path)).ref).to.eql('THING/2');
      expect((await model.links.thing).path).to.eql('THING/2'); // After save.

      /**
       * Unlink
       */
      thing.unlink();
      thing.unlink();
      thing.unlink();

      expect(await model.links.thing).to.eql(undefined); // Immediate - before save.

      expect(model.changes.length).to.eql(1);
      expect(model.isChanged).to.eql(true);
      expect(model.changes.map).to.eql({ ref: undefined });
      expect(model.changes.list[0].kind).to.eql('LINK');

      await model.save();
      expect(model.isChanged).to.eql(false);
      expect(await model.links.thing).to.eql(undefined); // After save.

      expect((await db.getValue<any>(org.path)).ref).to.eql(undefined);

      /**
       * Switch links
       */
      thing.link('THING/2');
      expect((await model.links.thing).path).to.eql('THING/2');

      thing.link('THING/1');
      expect((await model.links.thing).path).to.eql('THING/1');

      thing.link('THING/3');
      expect((await model.links.thing).path).to.eql('THING/3');

      expect(model.changes.length).to.eql(3);

      expect((await db.getValue<any>(org.path)).ref).to.eql(undefined);
      await model.save();
      expect((await db.getValue<any>(org.path)).ref).to.eql('THING/3');
    });

    it('change 1:*', async () => {
      const model = await createOrgWithLinks();
      expect(model.changes.map).to.eql({});
      expect((await db.getValue<any>(org.path)).refs).to.eql(undefined);

      /**
       * Link
       */
      const things = model.links.things;
      things.link(['THING/2']);
      things.link(['THING/2']);
      things.link(['THING/2']); // De-duped

      expect(model.changes.length).to.eql(1); // Called 3-times, only one change registered.
      expect(model.isChanged).to.eql(true);
      expect(model.changes.map).to.eql({ refs: ['THING/2'] });
      expect(model.changes.list[0].kind).to.eql('LINK');

      expect((await model.links.things).map(m => m.path)).to.eql(['THING/2']);

      things.link(['THING/2', 'THING/1']); // Existing ref not duplicated. Change registered.
      expect(model.changes.length).to.eql(2);
      expect((await model.links.things).map(m => m.path)).to.eql(['THING/1', 'THING/2']);

      things.link(['THING/2', 'THING/1']); // No change.
      things.link(['THING/1', 'THING/2']); // No change.
      things.link(['THING/1']); // No change.
      things.link(['THING/2']); // No change.
      things.link([]); // No change.
      expect(model.changes.length).to.eql(2);

      things.link(['THING/3']);
      expect(model.changes.length).to.eql(3);

      /**
       * Save
       */
      expect((await db.getValue<any>(org.path)).refs).to.eql(undefined);
      expect((await model.save()).saved).to.eql(true);
      expect((await model.save()).saved).to.eql(false);
      expect((await db.getValue<any>(org.path)).refs).to.eql(['THING/1', 'THING/2', 'THING/3']);
      expect(model.doc.refs).to.eql(['THING/1', 'THING/2', 'THING/3']);
      expect(model.isChanged).to.eql(false);
      expect((await model.links.things).map(m => m.path)).to.eql(['THING/1', 'THING/2', 'THING/3']);

      /**
       * Unlink: single
       */
      things.unlink(['THING/2']);
      expect(model.changes.length).to.eql(1);
      expect(model.changes.map).to.eql({ refs: ['THING/1', 'THING/3'] });
      expect((await model.links.things).map(m => m.path)).to.eql(['THING/1', 'THING/3']);

      expect(model.doc.refs).to.eql(['THING/1', 'THING/2', 'THING/3']); // Change not commited yet.

      await model.save();
      expect(model.doc.refs).to.eql(['THING/1', 'THING/3']);
      expect((await db.getValue<any>(org.path)).refs).to.eql(['THING/1', 'THING/3']);

      /**
       * Unlink: all (clear)
       */
      things.unlink();
      things.unlink();
      things.unlink();
      expect(model.changes.length).to.eql(1);
      expect(model.changes.map).to.eql({ refs: undefined });
      expect(await model.links.things).to.eql([]);

      expect(model.doc.refs).to.eql(['THING/1', 'THING/3']); // Change not commited yet.
      expect((await db.getValue<any>(org.path)).refs).to.eql(['THING/1', 'THING/3']);

      await model.save();
      expect((await db.getValue<any>(org.path)).refs).to.eql(undefined);
      expect(await model.links.things).to.eql([]);
      expect(model.isChanged).to.eql(false);
    });

    it('link and unlink (no saving)', async () => {
      const model = await createOrgWithLinks();
      const things = model.links.things;

      things.link(['THING/2', 'THING/1', 'THING/3', 'THING/4']);
      expect(model.changes.map.refs).to.eql(['THING/1', 'THING/2', 'THING/3', 'THING/4']);

      things.unlink(['THING/2']);
      expect(model.changes.map.refs).to.eql(['THING/1', 'THING/3', 'THING/4']);

      things.unlink(['THING/3', 'THING/1', 'XXX']);
      expect(model.changes.map.refs).to.eql(['THING/4']);

      things.unlink(['THING/4']);
      expect(model.changes.map.refs).to.eql(undefined);
    });
  });

  describe('children', () => {
    it('has no children', async () => {
      const model = await createOrg();
      expect(model.children).to.eql({});
    });

    it('children: direct-descendents', async () => {
      const model = await createOrgWithChildren();
      const res = await model.children.things;
      const paths = res.map(model => model.path);
      expect(paths).to.eql(['ORG/123/1', 'ORG/123/2', 'ORG/123/3']);
    });

    it('children: sub-descendents', async () => {
      const model = await createOrgWithChildren();
      const res = await model.children.subthings;
      const paths = res.map(model => model.path);
      expect(paths).to.eql(['ORG/123/info/a', 'ORG/123/info/b']);
    });

    it('children: all-descendents', async () => {
      const model = await createOrgWithChildren();
      const res = await model.children.all;
      const paths = res.map(model => model.path);
      expect(paths).to.eql([
        'ORG/123',
        'ORG/123/1',
        'ORG/123/2',
        'ORG/123/3',
        'ORG/123/info/a',
        'ORG/123/info/b',
      ]);
    });

    it('fires children-loaded event', async () => {
      const model = await createOrgWithChildren();
      const events: t.IModelChildrenLoaded[] = [];
      model.events$
        .pipe(
          filter(e => e.type === 'MODEL/loaded/children'),
          map(e => e.payload as t.IModelChildrenLoaded),
        )
        .subscribe(e => events.push(e));

      await model.load();
      expect(events.length).to.eql(0);

      await model.children.all;
      await model.children.things;

      expect(events.length).to.eql(2);
      expect(events[0].field).to.eql('all');
      expect(events[1].field).to.eql('things');
    });

    it('caches children', async () => {
      const model = await createOrgWithChildren();

      const readChildren = async () => {
        return {
          things: await model.children.things,
          subthings: await model.children.subthings,
          all: await model.children.all,
        };
      };

      const res1 = await readChildren();
      const res2 = await readChildren();

      expect(res1.things.map(m => m.toObject())).to.eql([{ count: 1 }, { count: 2 }, { count: 3 }]);

      expect(res1.things).to.equal(res2.things);
      expect(res1.subthings).to.equal(res2.subthings);
      expect(res1.all).to.equal(res2.all);

      model.reset();
      const res3 = await readChildren();

      // New instances after [reset].
      expect(res2.things).to.not.equal(res3.things);
      expect(res2.subthings).to.not.equal(res3.subthings);
      expect(res2.all).to.not.equal(res3.all);

      expect(res3.things.map(m => m.toObject())).to.eql([{ count: 1 }, { count: 2 }, { count: 3 }]);

      await model.load({ force: true });
      const res4 = await readChildren();

      // New instances after force [load].
      expect(res4.things).to.not.equal(res3.things);
      expect(res4.subthings).to.not.equal(res3.subthings);
      expect(res4.all).to.not.equal(res3.all);
    });

    it('gets children via `load` method', async () => {
      const model = await createOrgWithChildren();

      const events: t.ModelEvent[] = [];
      model.events$.subscribe(e => events.push(e));
      expect(events.length).to.eql(0);

      await model.load({ withChildren: true });

      expect(events.length).to.eql(4);
      expect(events[0].type).to.eql('MODEL/loaded/children');
      expect(events[1].type).to.eql('MODEL/loaded/children');
      expect(events[2].type).to.eql('MODEL/loaded/children');
      expect(events[3].type).to.eql('MODEL/loaded/data');

      expect((events[3].payload as t.IModelDataLoaded).withChildren).to.eql(true);

      const linkEvents = events as t.IModelChildrenLoadedEvent[];
      expect(linkEvents[0].payload.field).to.eql('things');
      expect(linkEvents[1].payload.field).to.eql('subthings');
      expect(linkEvents[2].payload.field).to.eql('all');
    });
  });
});
