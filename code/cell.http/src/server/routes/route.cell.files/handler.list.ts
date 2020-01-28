import { models, Schema, t, util, defaultValue } from '../common';

export async function listCellFiles(args: {
  db: t.IDb;
  fs: t.IFileSystem;
  cellUri: string;
  host: string;
  expires?: string; // Links expire.
  includeFiles?: boolean;
  includeUrls?: boolean;
}) {
  try {
    const { db, host, expires } = args;
    const includeFiles = defaultValue(args.includeFiles, true);
    const includeUrls = defaultValue(args.includeUrls, true);

    // Prepare URIs.
    const cellUri = Schema.uri.parse<t.ICellUri>(args.cellUri);
    const nsUri = Schema.uri.parse<t.INsUri>(Schema.uri.create.ns(cellUri.parts.ns));

    // Retrieve data models.
    const ns = await models.Ns.create({ db, uri: nsUri.toString() }).ready;
    const cell = await models.Cell.create({ db, uri: cellUri.toString() }).ready;
    const cellLinks = cell.props.links || {};

    const getUrls = () => {
      const urlBuilder = util.urls(host).cell(cellUri.toString());
      return urlBuilder.files.urls(cellLinks, { expires });
    };

    const getFiles = async () => {
      return (await getCellFiles({ ns, cellLinks })).map;
    };

    // Prepare response.
    const urls = includeUrls ? getUrls() : undefined;
    const files = includeFiles ? await getFiles() : undefined;
    const total = urls ? urls.files.length : Schema.file.links.total(cellLinks);
    const data: t.IResGetCellFiles = {
      total,
      uri: cellUri.toString(),
      urls,
      files,
    };

    // Finish up.
    return { status: 200, data };
  } catch (err) {
    return util.toErrorPayload(err);
  }
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
