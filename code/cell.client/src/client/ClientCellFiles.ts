import { ERROR, http, Schema, t, util, FormData } from '../common';

export type IClientCellFilesArgs = { parent: t.IClientCell; urls: t.IUrls };

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
    const parent = this.args.parent;
    const url = parent.url.files.list;

    const resFiles = await http.get(url.toString());
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
      return (resMap as unknown) as T;
    }

    const map = resMap.body;
    const ns = parent.uri.parts.ns;

    const body = Object.keys(map).reduce((acc, fileid) => {
      const value = map[fileid];
      if (value) {
        const uri = Schema.uri.create.file(ns, fileid);
        acc.push({ uri, ...value });
      }
      return acc;
    }, [] as t.IClientFileData[]);

    const res: T = { ok: true, status: 200, body };
    return res;
  }

  public async upload(input: t.IClientCellFileUpload | t.IClientCellFileUpload[]) {
    const parent = this.args.parent;
    const files = Array.isArray(input) ? input : [input];

    // Prepare the form data.
    const form = new FormData();
    files.forEach(({ filename, data }) => {
      form.append('file', data, {
        filename,
        contentType: 'application/octet-stream',
      });
    });
    const headers = form.getHeaders();

    // POST to the service.
    const url = parent.url.files.upload.toString();
    const res = await http.post(url, form, { headers });

    // Finish up.
    return util.toResponse<t.IResPostCellFiles>(res);
  }

  public async delete(filename: string | string[]) {
    const urls = this.args.parent.url;
    return deleteFiles({ urls, filename, action: 'DELETE' });
  }

  public async unlink(filename: string | string[]) {
    const urls = this.args.parent.url;
    return deleteFiles({ urls, filename, action: 'UNLINK' });
  }
}

/**
 * Helpers
 */

export async function deleteFiles(args: {
  urls: t.IUrlsCell;
  action: t.IReqDeleteCellFilesBody['action'];
  filename: string | string[];
}) {
  const { urls, action, filename } = args;
  const filenames = Array.isArray(filename) ? filename : [filename];
  const body: t.IReqDeleteCellFilesBody = { filenames, action };
  const url = urls.files.delete;
  const res = await http.delete(url.toString(), body);
  return util.toResponse<t.IResDeleteCellFilesData>(res);
}
