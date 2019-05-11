import { link } from '.';
import { Db, expect, expectError, fs } from '../test';

const dir = 'tmp/db';
after(async () => fs.remove('tmp'));

type IUser = { id: string; org?: string; friends?: [] };
type IOrg = { id: string; users?: [] };

const ids = {
  user1: 'user-1',
  user2: 'user-2',
  user3: 'user-3',
  org1: 'org-1',
  org2: 'org-2',
};

const toUserDbKey = (id: string) => `KEY/user/${id}`;
const toOrgDbKey = (id: string) => `KEY/org/${id}`;

describe('oneToMany', () => {
  beforeEach(async () => fs.remove(dir));

  describe('link', () => {
    it('links org-to-user', async () => {
      const db = await Db.create({ dir });
      const userDbKey = toUserDbKey(ids.user1);
      const orgDbKey = toOrgDbKey(ids.org1);

      await db.put(userDbKey, { id: ids.user1 });
      await db.put(orgDbKey, { id: ids.org1, name: 'Acme' });

      const oneToMany = link.oneToMany<IUser, IOrg>({
        db,
        one: { dbKey: userDbKey, field: 'org' },
        many: { dbKey: orgDbKey, field: 'users' },
      });
      const res = await oneToMany.link();

      expect(res.many.users).to.include(ids.user1);
      expect(res.one.org).to.eql(ids.org1);

      const user = (await db.get(userDbKey)).value as IUser;
      const org = (await db.get(orgDbKey)).value as IOrg;

      expect(user.org).to.eql(ids.org1);
      expect(org.users).to.include(ids.user1);
    });

    it('links several users', async () => {
      const db = await Db.create({ dir });

      const orgDbKey = toOrgDbKey(ids.org1);
      const userDbKey1 = toUserDbKey(ids.user1);
      const userDbKey2 = toUserDbKey(ids.user2);

      await db.put(orgDbKey, { id: ids.org1, name: 'Acme' });
      await db.put(userDbKey1, { id: ids.user1 });
      await db.put(userDbKey2, { id: ids.user2 });

      await link
        .oneToMany<IUser, IOrg>({
          db,
          one: { dbKey: userDbKey1, field: 'org' },
          many: { dbKey: orgDbKey, field: 'users' },
        })
        .link();
      await link
        .oneToMany<IUser, IOrg>({
          db,
          one: { dbKey: userDbKey2, field: 'org' },
          many: { dbKey: orgDbKey, field: 'users' },
        })
        .link();
      await link
        .oneToMany<IUser, IOrg>({
          db,
          one: { dbKey: userDbKey2, field: 'org' },
          many: { dbKey: orgDbKey, field: 'users' },
        })
        .link(); // NB: repeat (should have no effect)

      const org = (await db.get(orgDbKey)).value as IOrg;
      const user1 = (await db.get(userDbKey1)).value as IUser;
      const user2 = (await db.get(userDbKey2)).value as IUser;

      expect(org.users).to.eql(['user-1', 'user-2']);
      expect(user1.org).to.eql(ids.org1);
      expect(user2.org).to.eql(ids.org1);
    });

    it('throws if the many field is not an array', async () => {
      const db = await Db.create({ dir });
      const userDbKey = toUserDbKey(ids.user1);
      const orgDbKey = toOrgDbKey(ids.org1);

      await db.put(userDbKey, { id: ids.user1 });
      await db.put(orgDbKey, { id: ids.org1, name: 'Acme', users: 'NOT_A_LIST' });
      const oneToMany = link.oneToMany<IUser, IOrg>({
        db,
        one: { dbKey: userDbKey, field: 'org' },
        many: { dbKey: orgDbKey, field: 'users' },
      });

      await expectError(async () => {
        await oneToMany.link();
      }, 'must be an array');
    });

    describe('throws if model does not exist', () => {
      it('neither', async () => {
        const db = await Db.create({ dir });
        const userDbKey = toUserDbKey(ids.user1);
        const orgDbKey = toOrgDbKey(ids.org1);
        await expectError(async () => {
          await link
            .oneToMany<IUser, IOrg>({
              db,
              one: { dbKey: userDbKey, field: 'org' },
              many: { dbKey: orgDbKey, field: 'users' },
            })
            .link();
        });
      });

      it('no "singular" model', async () => {
        const db = await Db.create({ dir });
        const userDbKey = toUserDbKey(ids.user1);
        const orgDbKey = toOrgDbKey(ids.org1);
        await expectError(async () => {
          await db.put(orgDbKey, { id: ids.org1, name: 'Acme' });
          await link
            .oneToMany<IUser, IOrg>({
              db,
              one: { dbKey: userDbKey, field: 'org' },
              many: { dbKey: orgDbKey, field: 'users' },
            })
            .link();
        });
      });

      it('no "many" model', async () => {
        const db = await Db.create({ dir });
        const userDbKey = toUserDbKey(ids.user1);
        const orgDbKey = toOrgDbKey(ids.org1);
        await expectError(async () => {
          await db.put(userDbKey, { id: ids.user1 });
          await link
            .oneToMany<IUser, IOrg>({
              db,
              one: { dbKey: userDbKey, field: 'org' },
              many: { dbKey: orgDbKey, field: 'users' },
            })
            .link();
        });
      });
    });
  });

  describe('unlink', () => {
    it('removes link refs', async () => {
      const db = await Db.create({ dir });
      const orgDbKey = toOrgDbKey(ids.org1);
      const userDbKey1 = toUserDbKey(ids.user1);
      const userDbKey2 = toUserDbKey(ids.user2);

      await db.put(orgDbKey, { id: ids.org1, name: 'Acme' });
      await db.put(userDbKey1, { id: ids.user1 });
      await db.put(userDbKey2, { id: ids.user2 });

      await link
        .oneToMany<IUser, IOrg>({
          db,
          one: { dbKey: userDbKey1, field: 'org' },
          many: { dbKey: orgDbKey, field: 'users' },
        })
        .link();
      await link
        .oneToMany<IUser, IOrg>({
          db,
          one: { dbKey: userDbKey2, field: 'org' },
          many: { dbKey: orgDbKey, field: 'users' },
        })
        .link();

      await link
        .oneToMany<IUser, IOrg>({
          db,
          one: { dbKey: userDbKey1, field: 'org' },
          many: { dbKey: orgDbKey, field: 'users' },
        })
        .unlink();

      let org = (await db.get(orgDbKey)).value as IOrg;
      let user1 = (await db.get(userDbKey1)).value as IUser;
      let user2 = (await db.get(userDbKey2)).value as IUser;

      expect(org.users).to.eql(['user-2']);
      expect(user1.org).to.eql(undefined);
      expect(user2.org).to.eql('org-1');

      await link
        .oneToMany<IUser, IOrg>({
          db,
          one: { dbKey: userDbKey2, field: 'org' },
          many: { dbKey: orgDbKey, field: 'users' },
        })
        .unlink();

      org = (await db.get(orgDbKey)).value as IOrg;
      user1 = (await db.get(userDbKey1)).value as IUser;
      user2 = (await db.get(userDbKey2)).value as IUser;

      expect(org.users).to.eql([]);
      expect(user1.org).to.eql(undefined);
      expect(user2.org).to.eql(undefined);
    });
  });

  describe('refs', () => {
    it('retrieves models', async () => {
      const db = await Db.create({ dir });

      const orgDbKey = toOrgDbKey(ids.org1);
      const userDbKey1 = toUserDbKey(ids.user1);
      const userDbKey2 = toUserDbKey(ids.user2);

      await db.put(orgDbKey, { id: ids.org1, name: 'Acme' });
      await db.put(userDbKey1, { id: ids.user1 });
      await db.put(userDbKey2, { id: ids.user2 });

      const oneToMany1 = link.oneToMany<IUser, IOrg>({
        db,
        one: { dbKey: userDbKey1, field: 'org' },
        many: { dbKey: orgDbKey, field: 'users' },
      });

      const res1 = await oneToMany1.refs(ref => toUserDbKey(ref));
      expect(res1.length).to.eql(0);

      await oneToMany1.link();

      const oneToMany2 = link.oneToMany<IUser, IOrg>({
        db,
        one: { dbKey: userDbKey2, field: 'org' },
        many: { dbKey: orgDbKey, field: 'users' },
      });

      const res2 = await oneToMany2.refs(ref => toUserDbKey(ref));
      expect(res2.length).to.eql(1);
      expect(res2[0].id).to.eql(ids.user1);

      await oneToMany2.link();

      const res3 = await oneToMany2.refs(ref => toUserDbKey(ref));
      expect(res3.length).to.eql(2);
      expect(res3[0].id).to.eql(ids.user1);
      expect(res3[1].id).to.eql(ids.user2);
    });
  });
});

describe('manyToMany', () => {
  beforeEach(async () => fs.remove(dir));

  describe('link', () => {
    it.skip('links users-to-users', async () => {
      // const db = await Db.create({ dir });
      // const userDbKey1 = toUserDbKey(ids.user1);
      // const userDbKey2 = toUserDbKey(ids.user2);
      // const userDbKey3 = toUserDbKey(ids.user3);
      // await db.put(userDbKey1, { id: ids.user1 });
      // await db.put(userDbKey2, { id: ids.user2 });
      // await db.put(userDbKey3, { id: ids.user3 });
      // const manyToMany1 = link.manyToMany<IUser, IUser>({
      //   db,
      //   a: { dbKey: userDbKey1, field: 'friends' },
      //   b: { dbKey: userDbKey2, field: 'friends' },
      // });
      // const res1 = await manyToMany1.link();
    });
  });
});
