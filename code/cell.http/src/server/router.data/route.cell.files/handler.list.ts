import { models, Schema, t, util } from '../common';

export async function listCellFilesHandler(args: {
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
  const cell = await models.Cell.create({ db, uri: cellUri.toString() }).ready;
  const ns = await models.Ns.create({ db, uri: nsUri.toString() }).ready;

  // Construct links object.
  const urlBuilder = util.urls(host).cell(cellUri.toString());
  const cellLinks = cell.props.links || {};
  const urls = urlBuilder.files.urls(cellLinks);
  const linkUris = Object.keys(cellLinks)
    .map(key => cellLinks[key])
    .map(value => Schema.file.links.parseLink(value));
  const linkExists = (fileid: string) => {
    const fileUri = Schema.uri.create.file(nsUri.parts.id, fileid);
    return linkUris.some(item => item.uri === fileUri);
  };

  // Prepare files map.
  const files = { ...(await models.ns.getChildFiles({ model: ns })) };
  Object.keys(files).forEach(fileid => {
    if (!linkExists(fileid)) {
      delete files[fileid]; // NB: Trim off files that are not referenced by this cell.
    }
  });

  // Finish up.
  const data: t.IResGetCellFiles = {
    uri: cellUri.toString(),
    cell: urlBuilder.info,
    urls,
    files,
  };

  return { status: 200, data };
}
