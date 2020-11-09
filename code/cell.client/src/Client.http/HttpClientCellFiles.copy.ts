import { t, util } from '../common';

/**
 * Copy files.
 */
export async function copyFiles(args: {
  http: t.IHttp;
  urls: t.IUrlsCell;
  files: t.IHttpClientCellFileCopy | t.IHttpClientCellFileCopy[];
  changes?: boolean;
  permission?: t.FsS3Permission;
}) {
  const { urls, http, changes, permission } = args;
  const files = Array.isArray(args.files) ? args.files : [args.files];
  const body: t.IReqPostCellFilesCopyBody = { files };
  const url = urls.files.copy.query({ changes, 's3:permission': permission });
  const res = await http.post(url.toString(), body);
  return util.fromHttpResponse(res).toClientResponse<t.IResPostCellFilesCopyData>();
}
