import { ERROR, FormData, Schema, t, util } from '../common';

export type IClientCellFilesArgs = { parent: t.IClientCell; urls: t.IUrls; http: t.IHttp };

/**
 * HTTP client for operating on a [Cell]'s files.
 */
export class ClientCellFiles implements t.IClientCellFiles {
  public static create(args: IClientCellFilesArgs): t.IClientCellFiles {
    return new ClientCellFiles(args);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IClientCellFilesArgs) {
    this.args = args;
  }

  /**
   * [Fields]
   */
  private readonly args: IClientCellFilesArgs;

  /**
   * [Methods]
   */
  public async map() {
    type T = t.IClientResponse<t.IFileMap>;
    const http = this.args.http;
    const parent = this.args.parent;
    const url = parent.url.files.list.toString();

    const resFiles = await http.get(url);
    if (!resFiles.ok) {
      const status = resFiles.status;
      const type = status === 404 ? ERROR.HTTP.NOT_FOUND : ERROR.HTTP.SERVER;
      const message = `Failed to get file map for '${parent.uri.toString()}'.`;
      return util.toError(status, type, message) as T;
    }

    const json = resFiles.json as t.IResGetCellFiles;
    const body = json.files;
    const res: T = { ok: true, status: 200, body };

    return res;
  }

  public async list() {
    type T = t.IClientResponse<t.IClientFileData[]>;
    const parent = this.args.parent;

    const resMap = await this.map();
    if (!resMap.ok) {
      const res: T = { ...resMap, body: [] };
      return res;
    }

    const map = resMap.body;
    const ns = parent.uri.parts.ns;

    const body = Object.keys(map).reduce((acc, fid) => {
      const value = map[fid];
      if (value) {
        const uri = Schema.uri.create.file(ns, fid);
        acc.push({ uri, ...value });
      }
      return acc;
    }, [] as t.IClientFileData[]);

    const res: T = { ok: true, status: 200, body };
    return res;
  }

  public async upload(input: t.IClientCellFileUpload | t.IClientCellFileUpload[]) {
    const http = this.args.http;
    const parent = this.args.parent;
    const files = Array.isArray(input) ? input : [input];

    // 1. Initial POST to the service.
    //    This sets up the models, and retrieves the pre-signed S3 urls to upload to.
    const url = parent.url.files.upload.toString();
    const body: t.IReqPostCellUploadFilesBody = {
      seconds: undefined, // Expires.
      files: files.map(({ filename }) => ({ filename })),
    };

    const res1 = await http.post(url, body);
    if (!res1.ok) {
      const type = ERROR.HTTP.SERVER;
      const message = `Failed during initial file-upload step to '${parent.uri.toString()}'.`;
      return util.toError(res1.status, type, message);
    }

    // 2. Upload files to S3.
    const uploads = (res1.json as t.IResPostCellFiles).urls.uploads;
    const uploadWait = uploads
      .map(upload => {
        const file = files.find(item => item.filename === upload.filename);
        const data = file ? file.data : undefined;
        return { data, upload };
      })
      .filter(({ data }) => Boolean(data))
      .map(async ({ upload, data }) => {
        const { url } = upload;

        const uploadToS3 = async () => {
          // Prepare upload multi-part form.
          const props = upload.props;
          const contentType = props['content-type'];
          const form = new FormData();
          Object.keys(props)
            .map(key => ({ key, value: props[key] }))
            .forEach(({ key, value }) => form.append(key, value));
          form.append('file', data, { contentType }); // NB: file-data must be added last for S3.

          // Send form to S3.
          const headers = form.getHeaders();
          return http.post(url, form, { headers });
        };

        const uploadToLocal = async () => {
          // HACK:  There is a problem sending the multi-part form to the local
          //        service, however just posting the data as a buffer works fine.
          const path = upload.props.key;
          const headers = { 'content-type': 'multipart/form-data', path };
          return http.post(url, data, { headers });
        };

        // Upload data.
        const isLocal = url.startsWith('http://localhost');
        const res = await (isLocal ? uploadToLocal() : uploadToS3());

        // Finish up.
        const { ok, status } = res;
        const { uri, filename, expiresAt } = upload;
        return { ok, status, uri, filename, expiresAt };
      });

    const res2 = await Promise.all(uploadWait);
    const uploadErrors = res2.filter(item => !item.ok);
    const uploadSuccess = res2.filter(item => item.ok);

    /**
     * TODO 🐷
     * - return list of upload errors.
     * - clean up upload errors.
     */

    // 3. Perform verification on each file-upload causing
    //    the underlying model(s) to be updated with file
    //    meta-data and the new file-hash.
    const verifyWait = uploadSuccess.map(async item => {
      const url = this.args.urls.file(item.uri).uploaded.toString();
      const body: t.IReqPostFileVerifiedBody = { overwrite: true };
      const res = await http.post(url, body);
      return res;
    });

    const res3 = await Promise.all(verifyWait);

    // console.log('-------------------------------------------');
    // console.log(
    //   'res3',
    //   res3.map(s => s.status),
    // );

    /**
     * TODO 🐷
     * - Return a comprehensive response object
     */

    // Finish up.
    return util.toResponse<t.IResPostCellFiles>(res1) as any;
  }

  public async delete(filename: string | string[]) {
    const urls = this.args.parent.url;
    const http = this.args.http;
    return deleteFiles({ http, urls, filename, action: 'DELETE' });
  }

  public async unlink(filename: string | string[]) {
    const urls = this.args.parent.url;
    const http = this.args.http;

    return deleteFiles({ http, urls, filename, action: 'UNLINK' });
  }
}

/**
 * Helpers
 */

export async function deleteFiles(args: {
  urls: t.IUrlsCell;
  action: t.IReqDeleteCellFilesBody['action'];
  filename: string | string[];
  http: t.IHttp;
}) {
  const { urls, action, filename, http } = args;
  const filenames = Array.isArray(filename) ? filename : [filename];
  const body: t.IReqDeleteCellFilesBody = { filenames, action };
  const url = urls.files.delete;
  const res = await http.delete(url.toString(), body);
  return util.toResponse<t.IResDeleteCellFilesData>(res);
}
