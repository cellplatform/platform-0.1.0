import { cheerio, Schema, t, util, models } from '../common';
import { downloadBinaryFile, downloadTextFile } from '../route.file';

export async function downloadFileByName(args: {
  host: string;
  db: t.IDb;
  fs: t.IFileSystem;
  cellUri: string;
  filename: string;
  matchHash?: string;
  expires?: string;
}) {
  const { db, fs, cellUri, filename, matchHash, host, expires } = args;
  const mime = util.toMimetype(filename) || 'application/octet-stream';

  const fileid = filename.split('.')[0] || '';
  const ns = Schema.uri.parse<t.ICellUri>(cellUri).parts.ns;
  const fileUri = Schema.uri.create.file(ns, fileid);

  // 404 if file URI not found.
  if (!fileUri) {
    const err = `The file '${filename}' is not linked to the cell [${cellUri}].`;
    return util.toErrorPayload(err, { status: 404 });
  }

  // Run the appropriate download handler.
  if (mime === 'text/html') {
    const res = await downloadTextFile({ host, db, fs, fileUri, filename, matchHash, mime });
    if (typeof res.data === 'string') {
      const data = await rewriteRelativePaths({ host, db, cellUri, html: res.data });
      return { ...res, data };
    } else {
      return res;
    }
  } else {
    return downloadBinaryFile({ host, db, fs, fileUri, filename, matchHash, expires });
  }
}

/**
 * Helpers
 */

async function rewriteRelativePaths(args: {
  host: string;
  db: t.IDb;
  cellUri: string;
  html: string;
  expires?: string;
}) {
  const { host, db, html, expires, cellUri } = args;
  const urls = Schema.urls(host);
  const cellUrls = urls.cell(args.cellUri);
  const $ = cheerio.load(html);

  const cell: t.IDbModelCell = await models.Cell.create({ db, uri: cellUri }).ready;
  const fileLinks = Schema.file.links.toList(cell.props.links);

  const find = (selector: string) => {
    const res: Cheerio[] = [];
    $(selector).each((i, el) => res.push($(el)));
    return res.filter(e => e.length > 0);
  };

  const findAttr = (attr: string) => {
    return find(`*[${attr}]`).map(el => {
      const value = el.attr(attr) || '';
      return { el, attr, value };
    });
  };

  const href = findAttr('href');
  const src = findAttr('src');

  if (href.length === 0 && src.length === 0) {
    return html;
  }

  const updateLink = (args: { attr: string; value: string; el: Cheerio }) => {
    const { attr, value, el } = args;
    const path = value.replace(/^\./, '').replace(/^\//, '');
    const link = fileLinks.find(link => link.file.path === path);
    if (link) {
      const hash = link.hash;
      const url = cellUrls.file
        .byFileUri(link.uri, link.file.ext)
        .query({ hash, expires })
        .toString();
      el.attr(attr, url);
    }
  };

  href.forEach(e => updateLink(e));
  src.forEach(e => updateLink(e));

  return $.html();
}
