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
export function init(args: t.PluginArgs) {
  const model = Model(args.model);
  if (model.isNode) {
    return undefined;
  } else {
    const obj = model.toObject();
    const html = obj.html;
    const title = obj.title || obj.namespace || 'Untitled';
    const inject = html?.inject ?? true;

    return new HtmlWebpackPlugin({
      title,
      inject,
      templateContent: renderer(args),
    });
  }
}

/**
 * Generate HTML.
 * https://github.com/jantimon/html-webpack-plugin#writing-your-own-templates
 */
export function renderer(args: t.PluginArgs) {
  const model = Model(args.model).toObject();
  return (args: { [option: string]: any }) => {
    const plugin = args.htmlWebpackPlugin as HtmlPlugin;
    const title = plugin.options.title;
    const el = <Page title={title} head={model.html?.head} body={model.html?.body} />;
    const html = ReactDOMServer.renderToStaticMarkup(el);
    return `<!DOCTYPE html>\n${html}`;
  };
}

/**
 * Render static <html> page.
 */
export type PageProps = { title?: string; head?: JSX.Element; body?: JSX.Element };
export const Page: React.FC<PageProps> = (props) => {
  const { title = 'Untitled' } = props;

  const head = props.head || (
    <head>
      <meta charSet={'UTF-8'} />
      <meta name={'viewport'} content={'width=device-width, initial-scale=1.0'} />
      <title>{title}</title>
    </head>
  );

  const body = props.body || (
    <body>
      <div id={'root'}></div>
    </body>
  );

  return (
    <html lang={'en'}>
      {head}
      {body}
    </html>
  );
};
