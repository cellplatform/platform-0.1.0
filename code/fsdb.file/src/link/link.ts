import { t, R } from '../common';

const getModel = async <T extends t.Json>(name: string, db: t.IDb, dbKey: string) => {
  const value = (await db.get(dbKey)).value as T;
  if (!value) {
    throw new Error(`The [${name}] target '${dbKey}' does not exist in the DB.`);
  }
  return value;
};

/**
 * Setup a helper for performing a `[1..n]` link between models.
 */
export function oneToMany<O extends { id: string }, M extends { id: string }>(args: {
  db: t.IDb;
  one: { dbKey: (id: string) => string; field: keyof O };
  many: { dbKey: (id: string) => string; field: keyof M };
}) {
  const { db, one, many } = args;

  const prepare = async (oneId: string, manyId: string) => {
    const oneKey = one.dbKey(oneId);
    const manyKey = many.dbKey(manyId);
    const oneModel = await getModel<O>('one/singular', db, oneKey);
    const manyModel = await getModel<M>('many', db, manyKey);
    const oneRef = oneModel[one.field];
    const manyRefs = (manyModel[many.field] || []) as string[];
    if (!Array.isArray(manyRefs)) {
      const field = String(many.field);
      throw new Error(
        `The target field '${field}' for the 'many' relationship on '${many.dbKey}' must be an array.`,
      );
    }

    // Finish up.
    return { oneModel, manyModel, oneRef, manyRefs, oneKey, manyKey };
  };

  return {
    /**
     * Assign the link.
     */
    async link(oneId: string, manyId: string) {
      const prep = await prepare(oneId, manyId);
      const { manyRefs, oneKey, manyKey } = prep;
      let { oneModel, manyModel } = prep;
      let batch: t.IDbKeyValue[] = [];

      // Assign reference to the "singular" target.
      if (oneModel[one.field as any] !== manyId) {
        oneModel = { ...oneModel, [one.field]: manyId };
        batch = [...batch, { key: oneKey, value: oneModel }];
      }

      // Assign reference to the "many" target.
      if (!manyRefs.includes(oneId)) {
        manyModel = { ...manyModel, [many.field]: [...manyRefs, oneId] };
        batch = [...batch, { key: manyKey, value: manyModel }];
      }

      // Finish up.
      await db.putMany(batch);
      return { one: oneModel, many: manyModel };
    },

    /**
     * Remove the link.
     */
    async unlink(oneId: string, manyId: string) {
      const prep = await prepare(oneId, manyId);
      const { manyRefs, oneKey, manyKey } = prep;
      let { oneModel, manyModel } = prep;
      let batch: t.IDbKeyValue[] = [];

      // Remove reference from the "singular" target.
      if (oneModel[one.field as any] === manyId) {
        oneModel = { ...oneModel };
        delete oneModel[one.field];
        batch = [...batch, { key: oneKey, value: oneModel }];
      }

      // Remove reference from the "many" target.
      if (manyRefs.includes(oneId)) {
        const refs = manyRefs.filter((item) => item !== oneId) as any;
        manyModel = { ...manyModel, [many.field]: refs };
        batch = [...batch, { key: manyKey, value: manyModel }];
      }

      // Finish up.
      await db.putMany(batch);
      return { one: oneModel, many: manyModel };
    },

    /**
     * Retrieve the `many` referenced models
     */
    async refs(oneId: string, manyId: string) {
      const { manyRefs } = await prepare(oneId, manyId);
      const keys = manyRefs.map((ref) => one.dbKey(ref));
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
  a: { dbKey: (id: string) => string; field: keyof A };
  b: { dbKey: (id: string) => string; field: keyof B };
}) {
  const { db, a, b } = args;

  const getRefs = <M>(name: string, model: M, field: keyof M, dbKey: string) => {
    const refs = (model[field] || []) as string[];
    if (!Array.isArray(refs)) {
      const fieldName = String(field);
      throw new Error(
        `The target field '${fieldName}' on the '${name}' side of the relationship with the DB key '${dbKey}' must be an array.`,
      );
    }
    return refs;
  };

  const prepare = async (idA: string, idB: string) => {
    const keyA = a.dbKey(idA);
    const keyB = b.dbKey(idB);
    const modelA = await getModel<A>('A', db, keyA);
    const modelB = await getModel<B>('B', db, keyB);
    const refsA = getRefs<A>('A', modelA, a.field, keyA);
    const refsB = getRefs<B>('B', modelB, b.field, keyB);
    return { modelA, modelB, refsA, refsB, keyA, keyB };
  };

  return {
    /**
     * Assign the link.
     */
    async link(idA: string, idB: string) {
      const prep = await prepare(idA, idB);
      const { refsA, refsB, keyA, keyB } = prep;
      let { modelA, modelB } = prep;
      modelA = { ...modelA, [a.field]: R.uniq([...refsA, modelB.id]) };
      modelB = { ...modelB, [b.field]: R.uniq([...refsB, modelA.id]) };
      await db.putMany([
        { key: keyA, value: modelA },
        { key: keyB, value: modelB },
      ]);
      return { a: modelA, b: modelB };
    },

    /**
     * Remove the link.
     */
    async unlink(idA: string, idB: string) {
      const prep = await prepare(idA, idB);
      const { refsA, refsB, keyA, keyB } = prep;
      let { modelA, modelB } = prep;

      modelA = { ...modelA, [a.field]: refsA.filter((ref) => ref !== modelB.id) };
      modelB = { ...modelB, [b.field]: refsB.filter((ref) => ref !== modelA.id) };
      await db.putMany([
        { key: keyA, value: modelA },
        { key: keyB, value: modelB },
      ]);
      return { a: modelA, b: modelB };
    },
  };
}

/**
 * Setup a helper for performing `[n..n]` links between models.
 */
export function oneToOne<A extends { id: string }, B extends { id: string }>(args: {
  db: t.IDb;
  a: { dbKey: (id: string) => string; field: keyof A };
  b: { dbKey: (id: string) => string; field: keyof B };
}) {
  const { db, a, b } = args;

  const prepare = async (idA: string, idB: string) => {
    const keyA = a.dbKey(idA);
    const keyB = b.dbKey(idB);
    const modelA = await getModel<A>('A', db, keyA);
    const modelB = await getModel<B>('B', db, keyB);
    return { modelA, modelB, keyA, keyB };
  };

  const link = async (idA: string, idB: string) => {
    const prep = await prepare(idA, idB);
    let { modelA, modelB } = prep;
    // let batch: any = {};
    let batch: t.IDbKeyValue[] = [];

    // Unlink any existing ref.
    if (modelA[a.field] && modelA[a.field] !== (modelB.id as any)) {
      await unlink(modelA.id, modelA[a.field] as any);
    }
    if (modelB[b.field] && modelB[b.field] !== (modelA.id as any)) {
      const key = a.dbKey(modelB[b.field] as any);
      let unlink: any = await getModel('previous', db, key);
      unlink = { ...unlink };
      delete unlink[a.field as any];
      batch = [...batch, { key, value: unlink }];
    }

    modelA = { ...modelA, [a.field]: modelB.id };
    modelB = { ...modelB, [b.field]: modelA.id };
    batch = [...batch, { key: prep.keyA, value: modelA }, { key: prep.keyB, value: modelB }];

    await db.putMany(batch);
    return { a: modelA, b: modelB };
  };

  const unlink = async (idA: string, idB: string) => {
    const prep = await prepare(idA, idB);
    let { modelA, modelB } = prep;

    modelA = { ...modelA };
    modelB = { ...modelB };
    delete modelA[a.field];
    delete modelB[b.field];

    await db.putMany([
      { key: prep.keyA, value: modelA },
      { key: prep.keyB, value: modelB },
    ]);
    return { a: modelA, b: modelB };
  };

  return { link, unlink };
}
