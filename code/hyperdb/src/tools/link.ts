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
  const prepare = async () => {
    // Retrieve the DB models.
    const model = {
      singular: (await db.get(singularDbKey)).value as S,
      many: (await db.get(manyDbKey)).value as M,
    };
    if (!model.singular) {
      throw new Error(`The [singular] target '${singularDbKey}' does not exist in the DB.`);
    }
    if (!model.many) {
      throw new Error(`The [many] target '${manyDbKey}' does not exist in the DB.`);
    }

    // Extract IDs.
    const id = {
      singular: model.singular.id as any,
      many: model.many.id as any,
    };

    const list = (model.many[manyField] || []) as string[];
    if (!Array.isArray(list)) {
      throw new Error(
        `The target field '${manyField}' for the 'many' relationship on '${manyDbKey}' must be an array.`,
      );
    }

    return { model, id, list };
  };

  return {
    async link() {
      const { id, model, list } = await prepare();

      // Assign reference to the "singular" target.
      if (model.singular[singularField] !== id.many) {
        model.singular[singularField] = id.many;
        await db.put(singularField, model.singular);
      }

      // Assign reference to the "many" target.
      if (!list.includes(id.singular)) {
        model.many[manyField] = [...list, id.singular] as any;
        await db.put(manyField, model.many);
      }

      // Finish up.
      return model;
    },
  };
}
