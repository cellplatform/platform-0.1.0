import { Schema, Urls, t, Uri, FormData, http, ERROR, util } from '../common';
import { ClientCellFile } from './ClientCellFile';

export type IClientCellArgs = { uri: string; urls: t.IUrls };

/**
 * An HTTP client for operating on [Cell]'s.
 */
export class ClientCell implements t.IClientCell {
  public static create(args: IClientCellArgs): t.IClientCell {
    return new ClientCell(args);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IClientCellArgs) {
    this.uri = Uri.parse<t.ICellUri>(args.uri);
    this.urls = args.urls;
    this.url = this.urls.cell(args.uri);
    this.file = ClientCellFile.create({ parent: this, urls: this.urls });
  }

  /**
   * [Fields]
   */

  private readonly urls: t.IUrls;

  public readonly uri: t.IUriParts<t.ICellUri>;
  public readonly url: t.IUrlsCell;
  public readonly file: t.IClientCellFile;

  /**
   * [Properties]
   */

  public async info() {
    const url = this.url.info;
    const res = await http.get(url.toString());
    return util.toResponse<t.IResGetCell>(res);
  }

  /**
   * [Methods]
   */

  public toString() {
    return this.uri.toString();
  }
}

// public get file() {
//   const self = this;
//   const fileUrl = this.url.file;
//   return {
//     /**
//      * Operate on a file by name.
//      */
//     name(filename: string) {
//       return {
//         /**
//          * Upload a file and associate it with the cell.
//          */
//         async upload(data: ArrayBuffer) {
//           // Prepare the form data.
//           const form = new FormData();
//           form.append('file', data, { contentType: 'application/octet-stream' });
//           const headers = form.getHeaders();

//           // POST to the service.
//           const url = fileUrl.byName(filename);
//           const res = await http.post(url.toString(), form, { headers });

//           // Finish up.
//           return util.toResponse<t.IResPostCellFile>(res);
//         },

//         /**
//          * Retrieve the info about the given file.
//          */
//         async download(): Promise<t.IClientResponse<ReadableStream>> {
//           // Get cell info.
//           const cellRes = await self.info();
//           if (!cellRes.body) {
//             const err = `Info about the cell "${self.uri.toString()}" not found.`;
//             return util.toError(404, ERROR.HTTP.NOT_FOUND, err);
//           }

//           // Look up link reference.
//           const cellInfo = cellRes.body.data;
//           const links = cellInfo.links || {};
//           const fileLinkKey = Schema.file.links.toKey(filename);
//           const fileLinkValue = links[fileLinkKey];
//           if (!fileLinkValue) {
//             const err = `A link within "${self.uri.toString()}" to the filename '${filename}' does not exist.`;
//             return util.toError(404, ERROR.HTTP.NOT_FOUND, err);
//           }

//           // Prepare the URL.
//           let url = fileUrl.byName(filename);
//           const link = Schema.file.links.parseLink(fileLinkValue);
//           url = link.hash ? url.query({ hash: link.hash }) : url;

//           // Request the download.
//           const res = await http.get(url.toString());
//           if (res.ok) {
//             return util.toResponse<ReadableStream>(res, { bodyType: 'BINARY' });
//           } else {
//             const err = `Failed while downloading file "${self.uri.toString()}".`;
//             return util.toError<ReadableStream>(res.status, ERROR.HTTP.SERVER, err);
//           }
//         },
//       };
//     },
//   };
// }
// }
