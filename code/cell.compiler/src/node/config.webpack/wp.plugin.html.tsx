import HtmlWebpackPlugin from 'html-webpack-plugin';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { Model } from '../common';
import * as t from './types';

/**
 * NOTE:  This is a partial type approximation.
 *        If you need more inspect the object and expand this type.
 *        https://github.com/jantimon/html-webpack-plugin#writing-your-own-templates
 */
export type HtmlPlugin = {
  tags: any;
  files: any;
  options: { title: string };
};

/**
 * Plugin: HTML
 *         https://webpack.js.org/plugins/html-webpack-plugin
 */
export function init(args: t.IArgs) {
  const model = Model(args.model);
  if (model.isNode) {
    return undefined;
  } else {
    const obj = model.toObject();
    const html = obj.html;

    return new HtmlWebpackPlugin({
      title: obj.title || obj.namespace || 'Untitled',
      inject: html?.inject,
      templateContent: renderer(args),
    });
  }
}

/**
 * Generate HTML.
 * https://github.com/jantimon/html-webpack-plugin#writing-your-own-templates
 */
export function renderer(args: t.IArgs) {
  return (args: { [option: string]: any }) => {
    const plugin = args.htmlWebpackPlugin as HtmlPlugin;
    const title = plugin.options.title;
    const el = <Page title={title} />;
    const html = ReactDOMServer.renderToStaticMarkup(el);
    return `<!DOCTYPE html>\n${html}`;
  };
}

/**
 * Render static <html> page.
 */
export type PageProps = { title?: string };
export const Page: React.FC<PageProps> = (props) => {
  const { title = 'Untitled' } = props;
  return (
    <html lang={'en'}>
      <head>
        <meta charSet={'UTF-8'} />
        <meta name={'viewport'} content={'width=device-width, initial-scale=1.0'} />
        <title>{title}</title>
      </head>
      <body>
        <div id={'root'}></div>
      </body>
    </html>
  );
};
