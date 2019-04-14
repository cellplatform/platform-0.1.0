import { expect } from 'chai';
import { DbFactory } from '.';
import { create } from './create';
import { fs } from '@platform/fs';
import { time, t } from '../common';

const dir = 'tmp/db';
const dir1 = 'tmp/db-1';
const dir2 = 'tmp/db-2';
const dirs = [dir, dir1, dir2];
after(async () => fs.remove('tmp'));

describe('Factory', () => {
  beforeEach(() => dirs.forEach(dir => fs.removeSync(dir)));

  describe('create', () => {
    it('creates (not cached)', async () => {
      const factory = DbFactory.create({ create });
      expect(factory.isCached({ dir })).to.eql(false);
      const res = await factory.create({ dir, connect: false, cache: false });
      expect(res.db.dir).to.eql(dir);
      expect(factory.isCached({ dir })).to.eql(false);
      expect(factory.count).to.eql(0);
    });

    it('creates (cached, default)', async () => {
      const factory = DbFactory.create({ create });
      expect(factory.isCached({ dir })).to.eql(false);
      const res = await factory.create({ dir, connect: false });
      expect(res.db.dir).to.eql(dir);
      expect(factory.isCached({ dir })).to.eql(true);
      expect(factory.count).to.eql(1);
    });

    it('fires before/after events', async () => {
      const list: t.DbFactoryEvent[] = [];
      const factory = DbFactory.create({ create });
      factory.events$.subscribe(e => list.push(e));

      const args = { dir, connect: false };
      const res = await factory.create(args);

      const creating = list[0] as t.IDbFactoryCreatingEvent;
      const created = list[1] as t.IDbFactoryCreatedEvent;
      const change = list[2] as t.IDbFactoryChangeEvent;

      await time.wait(50);

      expect(list.length).to.eql(3);
      expect(creating.type).to.eql('DB_FACTORY/creating');
      expect(created.type).to.eql('DB_FACTORY/created');
      expect(change.type).to.eql('DB_FACTORY/change');

      expect(creating.payload).to.eql(args);
      expect(created.payload.args).to.eql(args);
      expect(created.payload.db).to.eql(res.db);
      expect(created.payload.network).to.eql(res.network);
    });

    it('adjusts the directory the DB is saved to within the [creating] event', async () => {
      const factory = DbFactory.create({ create });

      expect(fs.pathExistsSync(dir1)).to.eql(false);
      expect(fs.pathExistsSync(dir2)).to.eql(false);

      factory.creating$.subscribe(e => (e.dir = dir2));

      const args = { dir: dir1, connect: false };
      await factory.create(args);

      expect(fs.pathExistsSync(dir1)).to.eql(false);
      expect(fs.pathExistsSync(dir2)).to.eql(true); // NB: Dir adjusted to `dir2` in handler.
    });

    it.only('does not fire the creating/created events when DB already exists', async () => {
      let list: t.DbFactoryEvent[] = [];
      const factory = DbFactory.create({ create });
      factory.events$.subscribe(e => list.push(e));

      const args = { dir, connect: false };
      await factory.getOrCreate(args);

      expect(list.length).to.eql(3); // Initial creation.
      list = [];

      await factory.getOrCreate(args);
      expect(list.length).to.eql(0); // Cached.

      await factory.create(args);
      expect(list.length).to.eql(3); // Force created again ("create" method).
    });
  });

  describe('get', () => {
    it('undefined (not created)', () => {
      const factory = DbFactory.create({ create });
      const res = factory.get({ dir });
      expect(res).to.eql(undefined);
      expect(factory.count).to.eql(0);
    });

    it('gets a created instance from cache', async () => {
      const factory = DbFactory.create({ create });
      const res1 = await factory.create({ dir, connect: false });
      const res2 = factory.get({ dir });
      expect(factory.count).to.eql(1);
      expect(res1).to.not.eql(undefined);
      expect(res2).to.not.eql(undefined);
      expect(res2 && res2.db).to.eql(res1 && res1.db);
      expect(res2 && res2.network).to.eql(res1 && res1.network);
    });
  });

  describe('getOrCreate', () => {
    it('creates on get (caches, default)', async () => {
      const factory = DbFactory.create({ create });
      expect(factory.isCached({ dir })).to.eql(false);
      expect(factory.count).to.eql(0);
      const res = await factory.getOrCreate({ dir, connect: false });
      expect(res && res.db.dir).to.eql(dir);
      expect(factory.isCached({ dir })).to.eql(true);
      expect(factory.count).to.eql(1);
    });

    it('creates on get (no cache)', async () => {
      const factory = DbFactory.create({ create });
      expect(factory.isCached({ dir })).to.eql(false);
      const res = await factory.getOrCreate({ dir, connect: false, cache: false });
      expect(res && res.db.dir).to.eql(dir);
      expect(factory.isCached({ dir })).to.eql(false);
      expect(factory.count).to.eql(0);
    });
  });

  describe('dispose', () => {
    it('removes from cache on DB disposed', async () => {
      const factory = DbFactory.create({ create });
      const res = await factory.getOrCreate({ dir, connect: false });
      expect(factory.isCached({ dir })).to.eql(true);
      expect(factory.count).to.eql(1);
      res.db.dispose();
      expect(factory.isCached({ dir })).to.eql(false);
      expect(factory.count).to.eql(0);
    });

    it('disposes of network on DB disposed', async () => {
      const factory = DbFactory.create({ create });
      const res = await factory.getOrCreate({ dir, connect: false });
      const { db, network } = res;
      expect(network.isDisposed).to.eql(false);
      db.dispose();
      expect(network.isDisposed).to.eql(true);
    });
  });

  describe('reset', () => {
    it('disposes of all items', async () => {
      const factory = DbFactory.create({ create });
      const res1 = await factory.getOrCreate({ dir: dir1, connect: false });
      const res2 = await factory.getOrCreate({ dir: dir2, connect: false });

      expect(factory.count).to.eql(2);
      expect(res1.db.isDisposed).to.eql(false);
      expect(res2.db.isDisposed).to.eql(false);
      expect(res1.network.isDisposed).to.eql(false);
      expect(res2.network.isDisposed).to.eql(false);

      factory.reset();

      expect(factory.count).to.eql(0);
      expect(res1.db.isDisposed).to.eql(true);
      expect(res2.db.isDisposed).to.eql(true);
      expect(res1.network.isDisposed).to.eql(true);
      expect(res2.network.isDisposed).to.eql(true);
    });
  });

  describe('items', () => {
    it('has no items', () => {
      const factory = DbFactory.create({ create });
      expect(factory.items).to.eql([]);
    });

    it('has items', async () => {
      const factory = DbFactory.create({ create });
      const res1 = await factory.getOrCreate({ dir: dir1, connect: false });
      const res2 = await factory.getOrCreate({ dir: dir2, connect: false });

      const items = factory.items;
      expect(items.length).to.eql(2);

      expect(items[0].db).to.eql(res1.db);
      expect(items[1].db).to.eql(res2.db);

      expect(items[0].network).to.eql(res1.network);
      expect(items[1].network).to.eql(res2.network);
    });
  });

  describe('clone', () => {
    it('clones from empty', () => {
      const factory1 = DbFactory.create({ create });
      const factory2 = factory1.clone();
      expect(factory2).to.be.an.instanceof(DbFactory);
      expect(factory1).to.not.equal(factory2);
    });

    it('clones cache', async () => {
      const factory1 = DbFactory.create({ create });
      const res1 = await factory1.getOrCreate({ dir: dir1, connect: false });

      const factory2 = factory1.clone();
      const res2 = await factory2.getOrCreate({ dir: dir1, connect: false });
      const res3 = await factory2.getOrCreate({ dir: dir2, connect: false });

      expect(factory1.count).to.eql(1);
      expect(factory2.count).to.eql(2);

      expect(factory1.get({ dir: dir1 })).to.eql(res1);
      expect(factory2.get({ dir: dir1 })).to.eql(res1);
      expect(factory2.get({ dir: dir1 })).to.eql(res2);

      expect(factory1.get({ dir: dir2 })).to.eql(undefined);
      expect(factory2.get({ dir: dir2 })).to.eql(res3);
    });
  });
});
