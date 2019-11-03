import { t } from '../../common';
import { Schema } from '../../schema';

/**
 * Invoked before a [Cell] is persisted to the DB.
 */
export const beforeCellSave: t.BeforeModelSave<t.IDbModelCellProps> = async args => {
  const { changes } = args;
  const model = args.model as t.IDbModelCell;

  // Update cell namespace {links:{..}} to document-joins.
  if (changes.map.links) {
    const links = toUriList(model.props.links);

    // Link new namespaces.
    links
      .filter(link => link.uri === undefined || Schema.Uri.is.ns(link.uri))
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
};

/**
 * [Helpers]
 */
function toUriList(input?: t.IUriMap) {
  const items = input || {};
  return Object.keys(items).map(key => ({ key, uri: items[key] }));
}
