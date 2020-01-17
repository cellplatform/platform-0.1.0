import { models, Schema, t, util } from '../common';

export async function listCellFiles(args: {
  db: t.IDb;
  fs: t.IFileSystem;
  cellUri: string;
  host: string;
}) {
  const { db, host } = args;

  // Prepare URIs.
  const cellUri = Schema.uri.parse<t.ICellUri>(args.cellUri);
  const nsUri = Schema.uri.parse<t.INsUri>(Schema.uri.create.ns(cellUri.parts.ns));

  // Retrieve data models.
  const ns = await models.Ns.create({ db, uri: nsUri.toString() }).ready;
  const cell = await models.Cell.create({ db, uri: cellUri.toString() }).ready;

  // Construct links object.
  const urlBuilder = util.urls(host).cell(cellUri.toString());
  const cellLinks = cell.props.links || {};
  const urls = urlBuilder.files.urls(cellLinks);

  // Prepare files map.
  const files = (await getCellFiles({ ns, cellLinks })).map;

  // Finish up.
  const data: t.IResGetCellFiles = {
    uri: cellUri.toString(),
    cell: urlBuilder.info,
    urls,
    files,
  };

  return { status: 200, data };
}

/**
 * Helpers
 */

export async function getCellFiles(args: { ns: t.IDbModelNs; cellLinks: t.IUriMap }) {
  const { ns, cellLinks } = args;

  const linkExists = (fileid: string, cellLinks: t.IUriMap) => {
    const fileUri = Schema.uri.create.file(ns.props.id, fileid);
    return Object.values(cellLinks).some(value => value.startsWith(fileUri));
  };

  const map = { ...(await models.ns.getChildFiles({ model: ns })) };
  Object.keys(map).forEach(fileid => {
    if (!linkExists(fileid, cellLinks)) {
      delete map[fileid]; // NB: Trim off files that are not referenced by this cell.
    }
  });

  let list: Array<t.IUriData<t.IFileData>> | undefined; // NB: Lazy load.
  return {
    map,
    get list() {
      return list || (list = toFileList({ ns, map }));
    },
  };
}

export function toFileList(args: { ns: string | t.IDbModelNs; map: t.IMap<t.IFileData> }) {
  const { map } = args;
  const ns = typeof args.ns === 'string' ? args.ns : args.ns.props.id;
  return Object.keys(map).reduce((acc, fileid) => {
    const data = map[fileid];
    if (data) {
      const uri = Schema.uri.create.file(ns, fileid);
      acc.push({ uri, data });
    }
    return acc;
  }, [] as Array<t.IUriData<t.IFileData>>);
}
