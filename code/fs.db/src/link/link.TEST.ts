import { link } from '.';
import { expect, expectError } from '@platform/test';
import { fs } from '../common';
import { FileDb } from '../FileDb';

const dir = 'tmp/db-link';

const testDb = async (args: { dir: string }) => {
  const { dir } = args;
  return FileDb.create({ dir });
};

type IOrg = { id: string; users?: [] };
type IUser = { id: string; org?: string; friends?: []; profile?: string };
type IProfile = { id: string; user?: string };

const ids = {
  org1: 'org-1',
  org2: 'org-2',
  user1: 'user-1',
  user2: 'user-2',
  user3: 'user-3',
  profile1: 'profile-1',
  profile2: 'profile-2',
};

const toOrgDbKey = (id: string) => `KEY/org/${id}`;
const toUserDbKey = (id: string) => `KEY/user/${id}`;
const toProfileDbKey = (id: string) => `KEY/profile/${id}`;

describe('oneToMany', () => {
  beforeEach(async () => fs.remove(dir));

  describe('link', () => {
    it('links org-to-user', async () => {
      const db = await testDb({ dir });
      const userDbKey = toUserDbKey(ids.user1);
      const orgDbKey = toOrgDbKey(ids.org1);

      await db.put(userDbKey, { id: ids.user1 });
      await db.put(orgDbKey, { id: ids.org1, name: 'Acme' });

      const oneToMany = link.oneToMany<IUser, IOrg>({
        db,
        one: { dbKey: id => toUserDbKey(id), field: 'org' },
        many: { dbKey: id => toOrgDbKey(id), field: 'users' },
      });
      const res = await oneToMany.link(ids.user1, ids.org1);

      expect(res.many.users).to.include(ids.user1);
      expect(res.one.org).to.eql(ids.org1);

      const user = (await db.get(userDbKey)).value as IUser;
      const org = (await db.get(orgDbKey)).value as IOrg;

      expect(user.org).to.eql(ids.org1);
      expect(org.users).to.include(ids.user1);
    });

    it('links several users', async () => {
      const db = await testDb({ dir });

      const orgDbKey = toOrgDbKey(ids.org1);
      const userDbKey1 = toUserDbKey(ids.user1);
      const userDbKey2 = toUserDbKey(ids.user2);

      await db.put(orgDbKey, { id: ids.org1, name: 'Acme' });
      await db.put(userDbKey1, { id: ids.user1 });
      await db.put(userDbKey2, { id: ids.user2 });

      const linker = link.oneToMany<IUser, IOrg>({
        db,
        one: { dbKey: id => toUserDbKey(id), field: 'org' },
        many: { dbKey: id => toOrgDbKey(id), field: 'users' },
      });

      await linker.link(ids.user1, ids.org1);
      await linker.link(ids.user2, ids.org1);

      const org = (await db.get(orgDbKey)).value as IOrg;
      const user1 = (await db.get(userDbKey1)).value as IUser;
      const user2 = (await db.get(userDbKey2)).value as IUser;

      expect(org.users).to.eql(['user-1', 'user-2']);
      expect(user1.org).to.eql(ids.org1);
      expect(user2.org).to.eql(ids.org1);
    });

    it('throws if the many field is not an array', async () => {
      const db = await testDb({ dir });
      const userDbKey = toUserDbKey(ids.user1);
      const orgDbKey = toOrgDbKey(ids.org1);

      await db.put(userDbKey, { id: ids.user1 });
      await db.put(orgDbKey, { id: ids.org1, name: 'Acme', users: 'NOT_A_LIST' });
      const linker = link.oneToMany<IUser, IOrg>({
        db,
        one: { dbKey: id => toUserDbKey(id), field: 'org' },
        many: { dbKey: id => toOrgDbKey(id), field: 'users' },
      });

      await expectError(async () => {
        await linker.link(ids.user1, ids.org1);
      }, 'must be an array');
    });

    describe('throws if model does not exist', () => {
      it('neither', async () => {
        const db = await testDb({ dir });
        const linker = link.oneToMany<IUser, IOrg>({
          db,
          one: { dbKey: id => toUserDbKey(id), field: 'org' },
          many: { dbKey: id => toOrgDbKey(id), field: 'users' },
        });
        await expectError(async () => linker.link(ids.user1, ids.org1));
      });

      it('no "singular" model', async () => {
        const db = await testDb({ dir });
        const orgDbKey = toOrgDbKey(ids.org1);
        await db.put(orgDbKey, { id: ids.org1, name: 'Acme' });

        const linker = link.oneToMany<IUser, IOrg>({
          db,
          one: { dbKey: id => toUserDbKey(id), field: 'org' },
          many: { dbKey: id => toOrgDbKey(id), field: 'users' },
        });
        await expectError(async () => linker.link(ids.user1, ids.org1));
      });

      it('no "many" model', async () => {
        const db = await testDb({ dir });
        const userDbKey = toUserDbKey(ids.user1);
        await db.put(userDbKey, { id: ids.user1 });

        const linker = link.oneToMany<IUser, IOrg>({
          db,
          one: { dbKey: id => toUserDbKey(id), field: 'org' },
          many: { dbKey: id => toOrgDbKey(id), field: 'users' },
        });
        await expectError(async () => linker.link(ids.user1, ids.org1));
      });
    });
  });

  describe('unlink', () => {
    it('removes link refs', async () => {
      const db = await testDb({ dir });
      const orgDbKey = toOrgDbKey(ids.org1);
      const userDbKey1 = toUserDbKey(ids.user1);
      const userDbKey2 = toUserDbKey(ids.user2);

      await db.put(orgDbKey, { id: ids.org1, name: 'Acme' });
      await db.put(userDbKey1, { id: ids.user1 });
      await db.put(userDbKey2, { id: ids.user2 });

      const linker = link.oneToMany<IUser, IOrg>({
        db,
        one: { dbKey: id => toUserDbKey(id), field: 'org' },
        many: { dbKey: id => toOrgDbKey(id), field: 'users' },
      });

      await linker.link(ids.user1, ids.org1);
      await linker.link(ids.user2, ids.org1);
      await linker.unlink(ids.user1, ids.org1);

      let org = (await db.get(orgDbKey)).value as IOrg;
      let user1 = (await db.get(userDbKey1)).value as IUser;
      let user2 = (await db.get(userDbKey2)).value as IUser;

      expect(org.users).to.eql(['user-2']);
      expect(user1.org).to.eql(undefined);
      expect(user2.org).to.eql('org-1');

      await linker.unlink(ids.user2, ids.org1);

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
      const db = await testDb({ dir });

      const orgDbKey = toOrgDbKey(ids.org1);
      const userDbKey1 = toUserDbKey(ids.user1);
      const userDbKey2 = toUserDbKey(ids.user2);

      await db.put(orgDbKey, { id: ids.org1, name: 'Acme' });
      await db.put(userDbKey1, { id: ids.user1 });
      await db.put(userDbKey2, { id: ids.user2 });

      const linker = link.oneToMany<IUser, IOrg>({
        db,
        one: { dbKey: id => toUserDbKey(id), field: 'org' },
        many: { dbKey: id => toOrgDbKey(id), field: 'users' },
      });

      const res1 = await linker.refs(ids.user1, ids.org1);
      expect(res1.length).to.eql(0);

      await linker.link(ids.user1, ids.org1);
      const res2 = await linker.refs(ids.user1, ids.org1);

      expect(res2.length).to.eql(1);
      expect(res2[0].id).to.eql(ids.user1);

      await linker.link(ids.user2, ids.org1);
      const res3 = await linker.refs(ids.user2, ids.org1);

      expect(res3.length).to.eql(2);
      expect(res3[0].id).to.eql(ids.user1);
      expect(res3[1].id).to.eql(ids.user2);
    });
  });
});

describe('manyToMany', () => {
  beforeEach(async () => fs.remove(dir));

  describe('link', () => {
    it('links users-to-users', async () => {
      const db = await testDb({ dir });
      const userDbKey1 = toUserDbKey(ids.user1);
      const userDbKey2 = toUserDbKey(ids.user2);
      const userDbKey3 = toUserDbKey(ids.user3);

      await db.put(userDbKey1, { id: ids.user1 });
      await db.put(userDbKey2, { id: ids.user2 });
      await db.put(userDbKey3, { id: ids.user3 });

      expect((await db.getValue<IUser>(userDbKey1)).friends).to.eql(undefined);
      expect((await db.getValue<IUser>(userDbKey2)).friends).to.eql(undefined);
      expect((await db.getValue<IUser>(userDbKey3)).friends).to.eql(undefined);

      const linker = link.manyToMany<IUser, IUser>({
        db,
        a: { dbKey: id => toUserDbKey(id), field: 'friends' },
        b: { dbKey: id => toUserDbKey(id), field: 'friends' },
      });

      const res1 = await linker.link(ids.user1, ids.user2);

      expect(res1.a.id).to.eql('user-1');
      expect(res1.a.friends).to.eql(['user-2']);
      expect(res1.b.id).to.eql('user-2');
      expect(res1.b.friends).to.eql(['user-1']);

      expect((await db.getValue<IUser>(userDbKey1)).friends).to.eql(['user-2']);
      expect((await db.getValue<IUser>(userDbKey2)).friends).to.eql(['user-1']);

      // Repeat links do not cause duplicate refs to build up.
      await linker.link(ids.user1, ids.user2);
      await linker.link(ids.user1, ids.user2);
      await linker.link(ids.user1, ids.user2);

      expect((await db.getValue<IUser>(userDbKey1)).friends).to.eql(['user-2']);
      expect((await db.getValue<IUser>(userDbKey2)).friends).to.eql(['user-1']);

      await linker.link(ids.user1, ids.user3);

      expect((await db.getValue<IUser>(userDbKey1)).friends).to.eql(['user-2', 'user-3']);
      expect((await db.getValue<IUser>(userDbKey2)).friends).to.eql(['user-1']);
      expect((await db.getValue<IUser>(userDbKey3)).friends).to.eql(['user-1']);
    });

    it('unlinks users', async () => {
      const db = await testDb({ dir });
      const userDbKey1 = toUserDbKey(ids.user1);
      const userDbKey2 = toUserDbKey(ids.user2);
      const userDbKey3 = toUserDbKey(ids.user3);

      await db.put(userDbKey1, { id: ids.user1 });
      await db.put(userDbKey2, { id: ids.user2 });
      await db.put(userDbKey3, { id: ids.user3 });

      const linker = link.manyToMany<IUser, IUser>({
        db,
        a: { dbKey: id => toUserDbKey(id), field: 'friends' },
        b: { dbKey: id => toUserDbKey(id), field: 'friends' },
      });

      await linker.link(ids.user1, ids.user2);
      await linker.link(ids.user1, ids.user3);

      expect((await db.getValue<IUser>(userDbKey1)).friends).to.eql(['user-2', 'user-3']);
      expect((await db.getValue<IUser>(userDbKey2)).friends).to.eql(['user-1']);
      expect((await db.getValue<IUser>(userDbKey3)).friends).to.eql(['user-1']);

      await linker.unlink(ids.user1, ids.user3);

      expect((await db.getValue<IUser>(userDbKey1)).friends).to.eql(['user-2']);
      expect((await db.getValue<IUser>(userDbKey2)).friends).to.eql(['user-1']);
      expect((await db.getValue<IUser>(userDbKey3)).friends).to.eql([]);

      await linker.unlink(ids.user1, ids.user2);

      expect((await db.getValue<IUser>(userDbKey1)).friends).to.eql([]);
      expect((await db.getValue<IUser>(userDbKey2)).friends).to.eql([]);
      expect((await db.getValue<IUser>(userDbKey3)).friends).to.eql([]);
    });
  });

  describe('oneToOne', () => {
    beforeEach(async () => fs.remove(dir));

    it('link', async () => {
      const db = await testDb({ dir });
      const userKey1 = toUserDbKey(ids.user1);
      const userKey2 = toUserDbKey(ids.user2);
      const profileKey1 = toProfileDbKey(ids.profile1);
      const profileKey2 = toProfileDbKey(ids.profile2);

      await db.put(userKey1, { id: ids.user1 });
      await db.put(userKey2, { id: ids.user2 });
      await db.put(profileKey1, { id: ids.profile1 });
      await db.put(profileKey2, { id: ids.profile2 });

      const linker = link.oneToOne<IUser, IProfile>({
        db,
        a: { dbKey: id => toUserDbKey(id), field: 'profile' },
        b: { dbKey: id => toProfileDbKey(id), field: 'user' },
      });

      const res1 = await linker.link(ids.user1, ids.profile1);

      expect(res1.a.id).to.eql(ids.user1);
      expect(res1.a.profile).to.eql(ids.profile1);
      expect(res1.b.id).to.eql(ids.profile1);
      expect(res1.b.user).to.eql(ids.user1);

      expect((await db.getValue<IUser>(userKey1)).profile).to.eql(ids.profile1);
      expect((await db.getValue<IProfile>(profileKey1)).user).to.eql(ids.user1);

      // Change link - unlink old value.
      await linker.link(ids.user1, ids.profile2);

      expect((await db.getValue<IUser>(userKey1)).profile).to.eql(ids.profile2);
      expect((await db.getValue<IProfile>(profileKey1)).user).to.eql(undefined); // NB: Unlinked
      expect((await db.getValue<IProfile>(profileKey2)).user).to.eql(ids.user1);

      // Unlink again.
      await linker.link(ids.user2, ids.profile2);

      expect((await db.getValue<IUser>(userKey1)).profile).to.eql(undefined);
      expect((await db.getValue<IUser>(userKey2)).profile).to.eql(ids.profile2);
      expect((await db.getValue<IProfile>(profileKey1)).user).to.eql(undefined); // NB: Unlinked
      expect((await db.getValue<IProfile>(profileKey2)).user).to.eql(ids.user2);
    });

    it('unlink', async () => {
      const db = await testDb({ dir });
      const userKey1 = toUserDbKey(ids.user1);
      const profileKey1 = toProfileDbKey(ids.profile1);

      await db.put(userKey1, { id: ids.user1 });
      await db.put(profileKey1, { id: ids.profile1 });

      const linker = link.oneToOne<IUser, IProfile>({
        db,
        a: { dbKey: id => toUserDbKey(id), field: 'profile' },
        b: { dbKey: id => toProfileDbKey(id), field: 'user' },
      });

      await linker.link(ids.user1, ids.profile1);
      expect((await db.getValue<IUser>(userKey1)).profile).to.eql(ids.profile1);
      expect((await db.getValue<IProfile>(profileKey1)).user).to.eql(ids.user1);

      const res = await linker.unlink(ids.user1, ids.profile1);

      expect(res.a.profile).to.eql(undefined);
      expect(res.b.user).to.eql(undefined);

      expect((await db.getValue<IUser>(userKey1)).profile).to.eql(undefined);
      expect((await db.getValue<IProfile>(profileKey1)).user).to.eql(undefined);
    });
  });
});
