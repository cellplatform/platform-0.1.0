import { models, routes, Schema, t, util } from '../common';
import { getParams } from './cell.files.params';

/**
 * Cell routes for operating with files.
 */
export function init(args: { db: t.IDb; fs: t.IFileSystem; router: t.IRouter }) {
  const { db, router } = args;

  /**
   * GET: !A1/files
   */
  router.get(routes.CELL.FILES, async req => {
    const query = req.query as t.IUrlQueryCellFilesList;
    const params = req.params as t.IUrlParamsCellFiles;

    const paramData = getParams({ params });
    const { status, error } = paramData;

    if (!paramData.ns || error) {
      return { status, data: { error } };
    }

    // Prepare URIs.
    const cellUri = Schema.uri.parse<t.ICellUri>(paramData.uri);
    const nsUri = Schema.uri.parse<t.INsUri>(Schema.uri.create.ns(paramData.ns));

    // Retrieve data.
    const cell = await models.Cell.create({ db, uri: cellUri.toString() }).ready;
    const ns = await models.Ns.create({ db, uri: nsUri.toString() }).ready;

    // Construct links object.
    const urlBuilder = util.urls(req.host).cell(cellUri.toString());
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

    // Response.
    const data: t.IResGetCellFiles = {
      uri: cellUri.toString(),
      cell: urlBuilder.info,
      urls,
      files,
    };

    return { status: 200, data };
  });
}
