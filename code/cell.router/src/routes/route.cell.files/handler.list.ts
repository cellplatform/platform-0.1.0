import { models, Schema, t, util, defaultValue, minimatch } from '../common';

export async function listCellFiles(args: {
  db: t.IDb;
  fs: t.IFileSystem;
  cellUri: string;
  host: string;
  expires?: string; // File link expires.
  includeFiles?: boolean;
  includeUrls?: boolean;
  filter?: string; // Grep style filter pattern.
}) {
  try {
    const { db, host, expires, filter } = args;
    const includeFiles = defaultValue(args.includeFiles, true);
    const includeUrls = defaultValue(args.includeUrls, true);

    // Prepare URIs.
    const cellUri = Schema.Uri.cell(args.cellUri);
    const nsUri = Schema.Uri.ns(Schema.Uri.create.ns(cellUri.ns));

    // Retrieve data models.
    const ns = await models.Ns.create({ db, uri: nsUri.toString() }).ready;
    const cell = await models.Cell.create({ db, uri: cellUri.toString() }).ready;
    const cellLinks = filterFiles({ links: { ...(cell.props.links || {}) }, filter });

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
    const fileUri = Schema.Uri.create.file(ns.props.id, fileid);
    return Object.values(cellLinks).some((value) => value.startsWith(fileUri));
  };

  const map = { ...(await models.ns.getChildFiles({ model: ns })) };

  Object.keys(map).forEach((fileid) => {
    if (!linkExists(fileid, cellLinks)) {
      delete map[fileid]; // NB: Trim off files that are not referenced by this cell.
    }
  });

  let list: t.IUriData<t.IFileData>[] | undefined; // NB: Lazy load.
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
      const uri = Schema.Uri.create.file(ns, fileid);
      acc.push({ uri, data });
    }
    return acc;
  }, [] as t.IUriData<t.IFileData>[]);
}

function filterFiles(args: { links: t.IUriMap; filter?: string }) {
  let pattern = typeof args.filter === 'string' ? (args.filter || '').trim() : '';
  if (!pattern) {
    return args.links;
  }

  const FileLinks = Schema.file.links;
  const links = { ...args.links };
  pattern = pattern.replace(/^\/*/, '');

  Object.keys(links)
    .filter((key) => FileLinks.is.fileKey(key))
    .forEach((key) => {
      const path = FileLinks.parseKey(key).path;
      if (!minimatch(path, pattern)) {
        delete links[key];
      }
    });

  return links;
}
