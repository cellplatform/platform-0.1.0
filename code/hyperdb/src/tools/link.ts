import { t } from '../common';

export async function linkOneToMany<S extends { id: string }, M extends { id: string }>(
  db: t.IDb,
  singularDbKey: string,
  manyDbKey: string,
  singularField: keyof S,
  manyField: keyof M,
) {
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

  // Assign reference to the "singular" target.
  if (model.singular[singularField] !== id.many) {
    model.singular[singularField] = id.many;
    await db.put(singularField, model.singular);
  }

  // Assign reference to the "many" target.
  const manyList = (model.many[manyField] || []) as string[];
  if (!Array.isArray(manyList)) {
    throw new Error(
      `The target field '${manyField}' for the 'many' relationship on '${manyDbKey}' must be an array.`,
    );
  }
  if (!manyList.includes(id.singular)) {
    model.many[manyField] = [...manyList, id.singular] as any;
    await db.put(manyField, model.many);
  }

  // Finish up.
  return model;
}
