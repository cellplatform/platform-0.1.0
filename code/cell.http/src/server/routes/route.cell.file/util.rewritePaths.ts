import { cheerio, models, Schema, t, util } from '../common';

/**
 * Lookup path references within an HTML file
 * (eg elements with "src" and "href" attributes)
 * and rewrite the values to fully-qualified
 * CellOS file paths.
 */
export async function rewritePaths(args: {
  filename: string;
  html: string;
  host: string;
  db: t.IDb;
  cellUri: string;
  expires?: string;
}) {
  const { host, db, html, expires, cellUri } = args;

  // Query HTML/DOM looking for "src" or "href" elements.
  const $ = cheerio.load(html);
  const href = findAttr($, 'href');
  const src = findAttr($, 'src');
  if (href.length === 0 && src.length === 0) {
    return html; // NB: The HTML does not contain any elements that need path re-writes.
  }

  // Retrieve model data.
  const urls = Schema.urls(host);
  const cellUrls = urls.cell(args.cellUri);
  const cell: t.IDbModelCell = await models.Cell.create({ db, uri: cellUri }).ready;
  const fileLinks = Schema.file.links.toList(cell.props.links);

  // Lookup the link-reference to the HTML file.
  const fileid = args.filename.split('.')[0] || '';
  const htmlLink = fileLinks.find(link => link.file.id === fileid);
  if (!htmlLink) {
    const err = `Cannot find cell-link to file '${args.filename}' in [${cellUri}]`;
    throw new Error(err);
  }
  const dir = trimRelativePathPrefix(htmlLink.file.dir);

  const updateLink = (args: { attr: string; value: string; el: Cheerio }) => {
    if (util.isHttp(args.value)) {
      return; // NB: Only relative paths need to be updated.
    }

    const { attr, value, el } = args;
    const path = trimRelativePathPrefix(value);

    // Lookup the file-link that the DOM element "src/href" path refers to.
    const link = fileLinks.find(link => {
      const isChildPath = dir ? link.file.path.startsWith(`${dir}/`) : true;
      return isChildPath && trimPrefix(dir, link.file.path) === path;
    });

    // Rewrite the URL.
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

/**
 * [Helpers]
 */

function find($: CheerioStatic, selector: string) {
  const res: Cheerio[] = [];
  $(selector).each((i, el) => res.push($(el)));
  return res.filter(e => e.length > 0);
}

function findAttr($: CheerioStatic, attr: string) {
  return find($, `*[${attr}]`).map(el => {
    const value = el.attr(attr) || '';
    return { el, attr, value };
  });
}

function trimRelativePathPrefix(path: string) {
  return path
    .trim()
    .replace(/^\./, '')
    .replace(/^\//, '');
}

function trimPrefix(prefix: string, path: string) {
  return prefix ? path.substring(prefix.length + 1) : path;
}
