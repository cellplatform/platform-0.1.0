import { Schema, t, util, value } from '../../common';

/**
 * Invoked before a [Cell] is persisted to the DB.
 */
export const beforeCellSave: t.BeforeModelSave<t.IDbModelCellProps> = async args => {
  const { changes } = args;
  const model = args.model as t.IDbModelCell;
  const schema = Schema.from.cell(model.path);

  // Update cell namespace {links:{..}} to document-joins.
  if (changes.map.links) {
    const links = toUriList(model.props.links);

    // Link new namespaces.
    links
      .filter(link => link.uri === undefined || Schema.uri.is.ns(link.uri))
      .forEach(link => {
        const path = Schema.ns(link.uri).path;
        model.links.namespaces.link([path]);
      });

    // Unlink namespaces that are no longer referenced.
    (model.doc.nsRefs || []).forEach(path => {
      const uri = Schema.from.ns(path).uri;
      const exists = links.some(link => link.uri === uri);
      if (!exists) {
        model.links.namespaces.unlink([path]);
      }
    });
  }

  // Update hash.
  if (args.force || args.isChanged) {
    const data = { ...value.deleteUndefined(model.toObject()) };
    delete data.hash;
    model.props.hash = util.hash.cell({ uri: schema.uri, data });
  }
};

/**
 * [Helpers]
 */
function toUriList(input?: t.IUriMap) {
  const items = input || {};
  return Object.keys(items).map(key => ({ key, uri: items[key] }));
}
