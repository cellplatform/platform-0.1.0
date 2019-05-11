import { t } from '../common';

/**
 * Setup a helper for performing a `[1..n]` link between models.
 */
export function oneToMany<S extends { id: string }, M extends { id: string }>(
  db: t.IDb,
  singularDbKey: string,
  manyDbKey: string,
  singularField: keyof S,
  manyField: keyof M,
) {
  const getValue = async <T>(key: string) => (await db.get(key)).value as T;

  const prepare = async () => {
    const singular = await getValue<S>(singularDbKey);
    const many = await getValue<M>(manyDbKey);
    if (!singular) {
      throw new Error(`The [singular] target '${singularDbKey}' does not exist in the DB.`);
    }
    if (!many) {
      throw new Error(`The [many] target '${manyDbKey}' does not exist in the DB.`);
    }

    const manyRefs = (many[manyField] || []) as string[];
    if (!Array.isArray(manyRefs)) {
      throw new Error(
        `The target field '${manyField}' for the 'many' relationship on '${manyDbKey}' must be an array.`,
      );
    }

    // Finish up.
    return { singular, many, manyRefs };
  };

  return {
    /**
     * Assign the link.
     */
    async link() {
      const res = await prepare();
      const { manyRefs } = res;
      let { singular, many } = res;

      const manyId = many.id as any;
      const singularId = singular.id as any;

      // Assign reference to the "singular" target.
      if (singular[singularField] !== manyId) {
        singular = { ...singular, [singularField]: manyId };
        await db.put(singularDbKey, singular);
      }

      // Assign reference to the "many" target.
      if (!manyRefs.includes(singularId)) {
        many = { ...many, [manyField]: [...manyRefs, singularId] };
        await db.put(manyDbKey, many);
      }

      // Finish up.
      return { singular, many };
    },

    /**
     * Remove the link.
     */
    async unlink() {
      const res = await prepare();
      const { manyRefs } = res;
      let { singular, many } = res;

      const manyId = many.id as any;
      const singularId = singular.id as any;

      // Remove reference from the "singular" target.
      if (singular[singularField] === manyId) {
        singular = { ...singular };
        delete singular[singularField];
        await db.put(singularDbKey, singular);
      }

      // Remove reference from the "many" target.
      if (manyRefs.includes(singularId)) {
        const refs = manyRefs.filter(item => item !== singularId) as any;
        many = { ...many, [manyField]: refs };
        await db.put(manyDbKey, many);
      }

      // Finish up.
      return { singular, many };
    },
  };
}
