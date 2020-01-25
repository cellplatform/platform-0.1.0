import { cheerio, models, Schema, t } from '../common';

/**
 * Lookup path references within an HTML file
 * (eg elements with "src" and "href" attributes)
 * and rewrite the values to fully-qualified
 * CellOS file paths.
 */
export async function rewritePaths(args: {
  host: string;
  db: t.IDb;
  cellUri: string;
  html: string;
  expires?: string;
}) {
  const { host, db, html, expires, cellUri } = args;
  const urls = Schema.urls(host);
  const cellUrls = urls.cell(args.cellUri);

  const cell: t.IDbModelCell = await models.Cell.create({ db, uri: cellUri }).ready;
  const fileLinks = Schema.file.links.toList(cell.props.links);
  const $ = cheerio.load(html);

  const href = findAttr($, 'href');
  const src = findAttr($, 'src');
  if (href.length === 0 && src.length === 0) {
    return html; // NB: The HTML does not contain any elements that need path re-writes.
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

/**
 * [Helpers]
 */

const find = ($: CheerioStatic, selector: string) => {
  const res: Cheerio[] = [];
  $(selector).each((i, el) => res.push($(el)));
  return res.filter(e => e.length > 0);
};

const findAttr = ($: CheerioStatic, attr: string) => {
  return find($, `*[${attr}]`).map(el => {
    const value = el.attr(attr) || '';
    return { el, attr, value };
  });
};
