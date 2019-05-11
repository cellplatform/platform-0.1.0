import { t, R } from '../common';

const getValue = async <T>(db: t.IDb, key: string) => (await db.get(key)).value as T;

/**
 * Setup a helper for performing a `[1..n]` link between models.
 */
export function oneToMany<O extends { id: string }, M extends { id: string }>(args: {
  db: t.IDb;
  one: { dbKey: string; field: keyof O };
  many: { dbKey: string; field: keyof M };
}) {
  const { db, one, many } = args;

  const prepare = async () => {
    const oneModel = await getValue<O>(db, one.dbKey);
    const manyModel = await getValue<M>(db, many.dbKey);
    if (!oneModel) {
      throw new Error(`The [singular] target '${one.dbKey}' does not exist in the DB.`);
    }
    if (!manyModel) {
      throw new Error(`The [many] target '${many.dbKey}' does not exist in the DB.`);
    }

    const oneRef = oneModel[one.field];
    const manyRefs = (manyModel[many.field] || []) as string[];
    if (!Array.isArray(manyRefs)) {
      throw new Error(
        `The target field '${many.field}' for the 'many' relationship on '${
          many.dbKey
        }' must be an array.`,
      );
    }

    // Finish up.
    return { oneModel, manyModel, oneRef, manyRefs };
  };

  return {
    /**
     * Assign the link.
     */
    async link() {
      const prep = await prepare();
      const { manyRefs } = prep;
      let { oneModel, manyModel } = prep;

      const manyId = manyModel.id as any;
      const singularId = oneModel.id as any;
      let batch: any = {};

      // Assign reference to the "singular" target.
      if (oneModel[one.field] !== manyId) {
        oneModel = { ...oneModel, [one.field]: manyId };
        batch = { ...batch, [one.dbKey]: oneModel };
      }

      // Assign reference to the "many" target.
      if (!manyRefs.includes(singularId)) {
        manyModel = { ...manyModel, [many.field]: [...manyRefs, singularId] };
        batch = { ...batch, [many.dbKey]: manyModel };
      }

      // Finish up.
      await db.putMany(batch);
      return { one: oneModel, many: manyModel };
    },

    /**
     * Remove the link.
     */
    async unlink() {
      const prep = await prepare();
      const { manyRefs } = prep;
      let { oneModel, manyModel } = prep;

      const manyId = manyModel.id as any;
      const singularId = oneModel.id as any;
      let batch: any = {};

      // Remove reference from the "singular" target.
      if (oneModel[one.field] === manyId) {
        oneModel = { ...oneModel };
        delete oneModel[one.field];
        batch = { ...batch, [one.dbKey]: oneModel };
      }

      // Remove reference from the "many" target.
      if (manyRefs.includes(singularId)) {
        const refs = manyRefs.filter(item => item !== singularId) as any;
        manyModel = { ...manyModel, [many.field]: refs };
        batch = { ...batch, [many.dbKey]: manyModel };
      }

      // Finish up.
      await db.putMany(batch);
      return { one: oneModel, many: manyModel };
    },

    /**
     * Retrieve the `many` referenced models
     */
    async refs(toDbKey: (ref: string) => string) {
      const { manyRefs } = await prepare();
      const keys = manyRefs.map(ref => toDbKey(ref));
      const values = keys.length > 0 ? await db.getMany(keys) : {};
      return Object.keys(values).reduce((acc: M[], key) => {
        const model = values[key].value;
        return [...acc, model];
      }, []) as M[];
    },
  };
}

/**
 * Setup a helper for performing `[n..n]` links between models.
 */
export function manyToMany<A extends { id: string }, B extends { id: string }>(args: {
  db: t.IDb;
  a: { dbKey: string; field: keyof A };
  b: { dbKey: string; field: keyof B };
}) {
  const { db, a, b } = args;

  const getRefs = <M>(name: string, model: M, field: keyof M, dbKey: string) => {
    const refs = (model[field] || []) as string[];
    if (!Array.isArray(refs)) {
      throw new Error(
        `The target field '${field}' on the '${name}' side of the relationship with the DB key '${dbKey}' must be an array.`,
      );
    }
    return refs;
  };

  const prepare = async () => {
    const modelA = await getValue<A>(db, a.dbKey);
    const modelB = await getValue<B>(db, b.dbKey);
    if (!modelA) {
      throw new Error(`The [A] target '${a.dbKey}' does not exist in the DB.`);
    }
    if (!modelB) {
      throw new Error(`The [B] target '${b.dbKey}' does not exist in the DB.`);
    }
    const refsA = getRefs<A>('A', modelA, a.field, a.dbKey);
    const refsB = getRefs<B>('B', modelB, b.field, b.dbKey);
    return { modelA, modelB, refsA, refsB };
  };

  return {
    /**
     * Assign the link.
     */
    async link() {
      const prep = await prepare();
      const { refsA, refsB } = prep;
      let { modelA, modelB } = prep;
      modelA = { ...modelA, [a.field]: R.uniq([...refsA, modelB.id]) };
      modelB = { ...modelB, [b.field]: R.uniq([...refsB, modelA.id]) };
      const batch = {
        [a.dbKey]: modelA,
        [b.dbKey]: modelB,
      };
      await db.putMany(batch);
      return { a: modelA, b: modelB };
    },

    /**
     * Remove the link.
     */
    async unlink() {
      const prep = await prepare();
      const { refsA, refsB } = prep;
      let { modelA, modelB } = prep;

      modelA = { ...modelA, [a.field]: refsA.filter(ref => ref !== modelB.id) };
      modelB = { ...modelB, [b.field]: refsB.filter(ref => ref !== modelA.id) };
      const batch = {
        [a.dbKey]: modelA,
        [b.dbKey]: modelB,
      };
      await db.putMany(batch);
      return { a: modelA, b: modelB };
    },
  };
}

/**
 * - A/B
 * - getMany (on hyperdb)
 * - oneToMany
 * - manyToMany
 * - oneToOne
 */
