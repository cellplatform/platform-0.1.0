import { t, util } from '../common';

/**
 * Delete (or unlink) files.
 */
export async function deleteFiles(args: {
  http: t.IHttp;
  urls: t.IUrlsCell;
  filename: string | string[];
  action: t.IReqDeleteCellFsBody['action'];
}) {
  const { urls, action, filename, http } = args;
  const filenames = Array.isArray(filename) ? filename : [filename];
  const body: t.IReqDeleteCellFsBody = { filenames, action };
  const url = urls.files.delete;
  const res = await http.delete(url.toString(), body);
  return util.fromHttpResponse(res).toClientResponse<t.IResDeleteCellFsData>();
}
