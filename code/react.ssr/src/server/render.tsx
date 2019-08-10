import * as ReactDOMServer from 'react-dom/server';

const renderStatic = require('glamor/server').renderStatic;

/**
 * Render to HTML
 */
export function toHtml(args: {
  el: JSX.Element;
  title?: string;
  scripts?: string | string[];
  stylesheets?: string | string[];
  id?: string;
}) {
  const { id = 'root' } = args;
  const { html, css } = renderStatic(() => ReactDOMServer.renderToString(args.el));

  const scripts = toArray(args.scripts)
    .map(file => `<script src="${file}"></script>`)
    .join('\n');

  const stylesheets = toArray(args.stylesheets)
    .map(file => `<link rel="stylesheet" type="text/css" href="${file}">`)
    .join('\n');

  const tmpl = `
    <!doctype html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>${args.title || 'App'}</title>
        ${stylesheets}
        <style>${css}</style>
      </head>
      <body>
        <div id="${id}">${html}</div>
        ${scripts}
      </body>
    </html>
  `;

  return tmpl;
}

/**
 * [Helpers]
 */

function toArray<T>(input?: T | T[]) {
  return Array.isArray(input) ? input : input ? [input] : [];
}
