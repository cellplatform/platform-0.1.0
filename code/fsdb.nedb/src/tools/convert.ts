import { NedbStore } from '../store';

export { NedbStore as Store };

/**
 * Updates all documents in the given NeDb to use `_id` fields instead of `path`.
 * Notes:
 *        This corrects older models that were stored
 *        with the path not used as the explicit _id.
 */
export async function pathsToId(args: { store: NedbStore }) {
  const { store } = args;
  const docs = await store.find({ path: { $exists: true } });

  let total = 0;

  for (const item of docs) {
    if (item.path) {
      // Insert version of doc with the path as the ID.
      const path = item.path;
      const exists = Boolean(await store.findOne({ _id: path }));
      if (!exists) {
        const doc = { ...item, _id: path };
        delete doc.path;
        await store.insert(doc);

        // Remove the old doc.
        await store.remove({ _id: item._id });

        // Finish up.
        total++;
      }
    }
  }

  return { total };
}
